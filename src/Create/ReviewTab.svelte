<script>
    import { slide } from "svelte/transition";
    import RangeSlider from "svelte-range-slider-pips";
    import Icon from "../Icon.svelte";
    import tfjs from "../tensorflow/TFJS";
    import { fly } from "svelte/transition";
    import {
        createVideoCurrentTime,
        createAAInProgress,
        createProjectUnsaved,
        createProject,
        createVideoPlayer,
        message
    } from "../stores";
    import { CreateNavToBeginning } from "../utils";
    import { GetAnalysisSummary, SEVERITY } from "./AnalysisSummary";
    import ProblemComponent from "./ReviewComponents/ProblemComponent.svelte";
    import { PlayChart } from "../Ingame/PlayChart";
    import { onDestroy, onMount } from "svelte";

    const publishTotalProblemLimit = 10;
    let keypointScoreThreshold = [0.5];
    let videoPlaybackRate = [1.0];
    let analysisCompletion;

    const clickPlaytestIcon = () => {
        PlayChart($createProject, $createProject.keypoints, true);
    };

    const playtest_icon_stops = [
        { color: "var(--color-pink-dark)", offset: "0" },
        { color: "var(--color-pink-light)", offset: "1" },
    ];

    const clickStopAnalyzeButton = () => {
        StopAA();
    };

    const StartAA = async () => {
        $createAAInProgress = true;
        await $createVideoPlayer.pauseVideo();
        await $createVideoPlayer.mute();
        window.postMessage({
            source: "dancetime",
            event_name: "dancetime-message:start-analysis",
            data: {
                playbackRate: videoPlaybackRate[0],
            },
        });

        CreateNavToBeginning($createVideoPlayer, false);
    };

    const StopAA = async () => {
        try {
            $createAAInProgress = false;
            await $createVideoPlayer.pauseVideo();
            await $createVideoPlayer.unMute();
            window.postMessage({
                source: "dancetime",
                event_name: "dancetime-message:stop-analysis"
            });
        } catch (e) {
            console.warn(e);
        }
    };

    const clickAnalyzeButton = async () => {
        StartAA();
    };

    const GetAnalysisCompletion = (analysisCompletion, keypoints) => {
        if (
            typeof analysisCompletion == "undefined" &&
            keypoints &&
            Object.keys(keypoints).length > 0
        ) {
            return 1;
        } else {
            return analysisCompletion || 0;
        }
    };

    $: {
        analysisCompletion =
            analysisCompletion == 0
                ? Object.keys($createProject.keypoints).length > 0
                : analysisCompletion;
    }

    const GetProblemsWithSeverity = (AAsummary) => {
        return AAsummary.filter((problem) => problem.severity != SEVERITY.NONE);
    };

    const GetProblemsText = (AAsummary) => {
        const real_problems = GetProblemsWithSeverity(AAsummary);

        if (real_problems.length == 0) {
            return `No Problems Detected. Looking good!`;
        } else {
            return `${real_problems.length} Problem${
                real_problems.length == 1 ? "" : "s"
            } Detected`;
        }
    };

    let AAsummary = [];
    $: {
        if ($createProject) {
            AAsummary = GetAnalysisSummary(
                $createProject,
                keypointScoreThreshold[0]
            );
        }

        setTimeout(() => {
            // clickPlaytestIcon() // JUST FOR TESTING
        }, 3000);
    }

    $: {
        if ($createAAInProgress) {
            analysisCompletion =
                $createVideoCurrentTime / $createProject.duration;
        }
    }

    let extensionInstalled = false;

    const onYoutubeIframeMessage = (args) => {
        if (args.event_name == "dancetime-iframe-message:get-status") {
            extensionInstalled = args.data.initialized == true;

            if (extensionInstalled && extensionCheckInterval) {
                clearInterval(extensionCheckInterval);
            }
        } else if (args.event_name == "dancetime-iframe-message:get-analysis") {
            $createProjectUnsaved = true;
            $createProject.keypoints = args.data.keypoints;
            $createProject = $createProject;
            StopAA();
        }
    };

    const onYoutubeMessage = async (args) => {
        const playerState = await $createVideoPlayer.getPlayerState();
        if (playerState == 0 && $createAAInProgress) {
            // Video ended, stop analysis if it is going
            StopAA();
        }
    }

    const onMessage = (evt) => {
        if (evt.origin == "https://youtube.com") {
            onYoutubeMessage(JSON.parse(evt.data));
            return;
        }

        if (
            evt.origin != "http://localhost:4280" &&
            evt.origin != "https://dancetime.io"
        ) {
            return;
        }

        if (evt.data.source != "dancetime-yt-iframe") {
            return;
        }

        onYoutubeIframeMessage(evt.data);
    }

    $: {
        onMessage($message)
    }

    let extensionCheckInterval;
    onMount(() => {
        extensionCheckInterval = setInterval(() => {
            window.postMessage({
                event_name: "dancetime-message:get-status",
                source: "dancetime",
            });
        }, 200);
    });

    onDestroy(() => {
        if (extensionCheckInterval) {
            clearInterval(extensionCheckInterval);
        }
    });
</script>

<main
    in:fly|local={{ duration: 200, x: 200, delay: 200 }}
    out:fly|local={{ duration: 200, x: -200 }}
>
    <section>
        <h1>Analyze Video</h1>
        {#if extensionInstalled}
            <div class="aa-grid">
                <h2>
                    Keypoint Score Threshold: {keypointScoreThreshold[0]
                        .toString()
                        .padEnd(4, "0")}
                </h2>
                <div class="slider-container">
                    <RangeSlider
                        bind:values={keypointScoreThreshold}
                        springValues={{ stiffness: 1, damping: 1 }}
                        min={0.1}
                        max={0.9}
                        step={0.05}
                        float
                        disabled={$createAAInProgress}
                    />
                </div>
                <h2
                    title="Rate at which the video is played when analyzing. Lower value: more accurate scoring, takes more time to analyze.&#10;Higher value: less accurate scoring, takes less time to analyze."
                >
                    Video Playback Rate: {videoPlaybackRate[0] % 1 == 0
                        ? `${videoPlaybackRate[0]}.0`
                        : videoPlaybackRate[0].toString().padEnd(3, "0")}
                </h2>
                <div class="slider-container">
                    <RangeSlider
                        bind:values={videoPlaybackRate}
                        springValues={{ stiffness: 1, damping: 1 }}
                        min={0.2}
                        max={3.0}
                        step={0.1}
                        float
                        disabled={$createAAInProgress}
                    />
                </div>
                {#if !$createAAInProgress}
                    <div class="button" on:click={clickAnalyzeButton}>
                        Start Automatic Analysis
                    </div>
                {:else}
                    <div class="button" on:click={clickStopAnalyzeButton}>
                        Stop Automatic Analysis
                    </div>
                {/if}
                <div class="aa-details">
                    <h3 class="percent-complete">
                        {(
                            GetAnalysisCompletion(
                                analysisCompletion,
                                $createProject.keypoints
                            ) * 100
                        ).toFixed(0)}% Complete
                    </h3>
                    {#if !$createAAInProgress && Object.keys($createProject.keypoints).length > 0}
                        <h3
                            transition:slide|local={{ duration: 400 }}
                            title="Amount of frames that have keypoint data. More = more accurate scoring."
                        >
                            {Object.keys($createProject.keypoints).length} Keypoint
                            Frames
                        </h3>
                    {/if}
                </div>
            </div>
        {:else}
            <h2>Browser extension required for video analysis.</h2>
            <br /><br />
            <h2><a href="#" target="_blank">Click here to install.</a></h2>
        {/if}
    </section>

    <section>
        <h1>Analysis Summary</h1>
        {#if AAsummary.length > 0 && !$createAAInProgress && Object.keys($createProject.keypoints).length > 0}
            <h2
                class="problems"
                class:none={GetProblemsWithSeverity(AAsummary).length == 0}
                transition:slide|local
            >
                {GetProblemsText(AAsummary)}
            </h2>
            <div class="problems-container" transition:slide|local>
                {#each AAsummary as problem}
                    <ProblemComponent {problem} />
                {/each}
                {#if GetProblemsWithSeverity(AAsummary).length > publishTotalProblemLimit}
                    <ProblemComponent
                        problem={{
                            title: "Too Many Problems",
                            message: `You have ${
                                GetProblemsWithSeverity(AAsummary).length
                            } problems, which is over the publish limit of ${publishTotalProblemLimit}.`,
                            severity: SEVERITY.HIGH,
                            impact: `Having this many problems with your chart means that you will not be able to publish your chart.`,
                            resolution: `Expand the other problem cards to view impact and potential fixes. This card will disappear when you have resolved more problems.`,
                        }}
                    />
                {/if}
            </div>
        {:else}
            <h2>Analyze the video to display a summary.</h2>
        {/if}
    </section>

    <section>
        <h1 class="playtest-title">
            Playtest
            <span class="playtest-icon" on:click={clickPlaytestIcon}>
                <Icon name="video_play_icon" stops={playtest_icon_stops} />
            </span>
        </h1>
        <h2>
            Play your chart to test it out! This is required to publish your
            chart.
        </h2>
    </section>
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 20px;
        cursor: default;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, 1fr);
        gap: 20px;
        overflow-y: scroll;
    }

    h1 {
        color: var(--color-gray-100);
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 12px;
    }

    h2 {
        color: var(--color-gray-300);
    }

    h3 {
        color: var(--color-gray-500);
    }

    div.aa-grid {
        display: grid;
        grid-template-columns: max-content 1fr;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }

    div.aa-details {
        margin-left: 1em;
        margin-right: 1em;
    }

    div.button {
        color: var(--color-gray-300);
        background-color: var(--color-gray-1000);
        padding: 6px;
        padding-left: 10px;
        padding-right: 10px;
        padding-bottom: 10px;
        border-radius: 6px;
        text-align: center;
        cursor: pointer;
        width: fit-content;
        user-select: none;
        height: fit-content;
    }

    div.button:hover {
        color: var(--color-gray-100);
    }

    div.button:active {
        background-color: var(--color-gray-800);
    }

    div.problems-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    h2.problems {
        margin-bottom: 20px;
    }

    h2.problems:not(.none) {
        color: var(--color-red-light);
    }

    h1.playtest-title {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    span.playtest-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        width: 1.5rem;
        height: 1.5rem;
        background-color: var(--color-gray-100);
        border-radius: 50px;
        cursor: pointer;
    }

    span.playtest-icon:active {
        transform: scale(1.1);
    }

    div.slider-container {
        --range-slider: var(
            --color-gray-500
        ); /* slider main background color */
        --range-handle-inactive: var(
            --color-gray-300
        ); /* inactive handle color */
        --range-handle: var(
            --color-yellow-dark
        ); /* non-focussed handle color */
        --range-handle-focus: var(
            --color-yellow-light
        ); /* focussed handle color */
        --range-handle-border: var(--range-handle);
        --range-range-inactive: var(
            --range-handle-inactive
        ); /* inactive range bar background color */
        --range-range: var(
            --range-handle-focus
        ); /* active range bar background color */
        --range-float-inactive: var(
            --range-handle-inactive
        ); /* inactive floating label background color */
        --range-float: var(
            --range-handle-focus
        ); /* floating label background color */
        --range-float-text: var(
            --color-gray-1000
        ); /* text color on floating label */
    }

    a {
        color: #4f85ed;
    }
</style>

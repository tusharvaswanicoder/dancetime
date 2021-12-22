<script>
    import { onDestroy, onMount, tick } from 'svelte';
    import WaveSurfer from 'wavesurfer.js';
    import {
        getThumbnails,
        getThumbnailsInParalell,
    } from './VideoThumbnailGenerator';
    import { THUMBNAIL_INTERVAL, COMPONENT_TYPE } from '../constants';
    import {
        createWaveSurfer,
        createVideo,
        createAudio,
        createVideoCurrentTime,
        createVideoFPS,
        createLoadingThumbnailsPercent,
        createThumbnailURLs,
        createProject,
        createEditorDisabled,
        createSelectedComponent,
        createVideoPlayer
    } from '../stores';
    import { ConvertDurationToNiceStringWithDecimal } from '../utils';
    import Icon from '../Icon.svelte';
    import VideoInOutPointsTimelineDisplay from './EditComponents/Displays/VideoInOutPointsTimelineDisplay.svelte';

    let timelineWidth = 0;
    let timelineHeight = 0;

    async function GetThumbnails(project) {
        if (!project || !dlManager.metaData[project.media_id]) {
            return;
        }

        const video_url =
            dlManager.metaData[project.media_id]['video_url'];

        if (!video_url) {
            return;
        }

        const thumbnail_blobs = await getThumbnailsInParalell(
            video_url,
            (progress) => {
                $createLoadingThumbnailsPercent = progress;
            }
        );
        
        if (!$createProject) {
            return;
        }

        $createThumbnailURLs = {};

        Object.keys(thumbnail_blobs).forEach((key) => {
            const new_key = (key / THUMBNAIL_INTERVAL).toFixed(0);
            $createThumbnailURLs[new_key] = URL.createObjectURL(
                thumbnail_blobs[key]
            );
        });
    }
    
    onMount(() => {
        $createWaveSurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: 'rgb(38, 126, 97)',
            progressColor: 'rgb(77, 189, 152)',
            interact: false,
            height: 50,
            responsive: true,
            hideScrollbar: true,
            backend: 'MediaElement'
        });

        // $createWaveSurfer.load(document.querySelector('audio'))

        $createWaveSurfer.setMute(true);
        // GetThumbnails($createProject);
    });

    const updateWaveSurferCurrentTime = (time) => {
        if (!$createWaveSurfer) {
            return;
        }
        $createWaveSurfer.setCurrentTime(time);
    };

    let width = 0;
    const timeline_padding = 4;
    const thumbs_padding = 4;
    let imageRef = null;
    let timelineThumbnails = [];

    onDestroy(() => {
        if (!$createWaveSurfer) {
            return;
        }
        $createWaveSurfer.destroy();
        $createWaveSurfer = null;

        Object.values($createThumbnailURLs).forEach((url) => {
            URL.revokeObjectURL(url);
        });
        $createThumbnailURLs = {};

        Object.values(timelineThumbnails).forEach((url) => {
            URL.revokeObjectURL(url);
        });
        timelineThumbnails = [];
    });

    const getNumThumbnailsToDisplay = async () => {
        if (!imageRef || imageRef.width == 0) {
            return;
        }

        const num_thumbnails_to_display = Math.ceil(
            timelineWidth / (imageRef.clientWidth + thumbs_padding)
        );

        timelineThumbnails = [];
        for (let i = 0; i < num_thumbnails_to_display; i++) {
            const timestamp =
                $createProject.duration * (i / num_thumbnails_to_display);
            const timestamp_interval = Math.ceil(
                timestamp / THUMBNAIL_INTERVAL
            );
            timelineThumbnails.push($createThumbnailURLs[timestamp_interval]);
        }

        timelineThumbnails = timelineThumbnails;
    };

    // $: {
    //     timelineWidth, timelineHeight, imageRef;
    //     getNumThumbnailsToDisplay();
    // }

    const onClickTimeline = (e) => {
        const percentClick = e.layerX / (width - timeline_padding * 2 - 2); // Account for padding + border width
        $createVideoPlayer.seekTo(percentClick * $createProject.duration, !mouseDownOnTimeline);
    };

    let mouseDownOnTimeline = false;
    const onMouseDownTimeline = (e) => {
        mouseDownOnTimeline = true;
    };
    
    const mouseMoveOnTimeline = (e) => {
        if (mouseDownOnTimeline) {
            onClickTimeline(e);
        }
    }

    const mouseOffTimeline = () => {
        mouseDownOnTimeline = false;
    };
    
    const hasComponentOfType = (type, project) => {
        return project.components.find((component) => component.type == type) != undefined;
    }

    let seekerProgressPercent = '0%';

    $: {
        seekerProgressPercent = `${
            ($createVideoCurrentTime / $createProject.duration) * 100
        }%`;
    }

    $: {
        updateWaveSurferCurrentTime($createVideoCurrentTime);
    }
</script>

<main
    bind:clientWidth={width}
    style={`--timeline-padding: ${timeline_padding}px`}
>
    <div class="lines">
        <div class="lines-container">
            {#each { length: 20 } as _, i}
                <div class="line" />
            {/each}
        </div>
        <div class="timestamp left">
            {ConvertDurationToNiceStringWithDecimal($createVideoCurrentTime)}
        </div>
        <div class="timestamp right">
            {ConvertDurationToNiceStringWithDecimal($createProject.duration)}
        </div>
    </div>
    <div class="timeline-container">
        <div class='timeline-underlays'>
            <!-- All underlay elements go here -->
            <div class='timeline-warning-text'>Thumbnails and waveform not available.</div>
        </div>
        <div
            class="thumbnails"
            bind:clientWidth={timelineWidth}
            bind:clientHeight={timelineHeight}
            style={`--thumbs-padding: ${thumbs_padding}px`}
        >
            {#if timelineThumbnails.length == 0}
                {#each Object.entries($createThumbnailURLs) as [key, thumbnail_blob]}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    {#if key == 0}
                        <img
                            src={thumbnail_blob}
                            on:load={getNumThumbnailsToDisplay}
                            bind:this={imageRef}
                        />
                    {:else}
                        <img src={thumbnail_blob} />
                    {/if}
                {/each}
            {:else}
                {#each timelineThumbnails as thumbnail_blob, key}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    {#if key == 0}
                        <img src={thumbnail_blob} bind:this={imageRef} />
                    {:else}
                        <img src={thumbnail_blob} />
                    {/if}
                {/each}
            {/if}
        </div>
        <div class="keyframes" />
        <div class="waveform" id="waveform" />
        <div class='timeline-overlays'>
            <!-- All overlay elements go here -->
            {#if hasComponentOfType(COMPONENT_TYPE.VIDEO_IN_OUT_POINTS, $createProject)}
                <VideoInOutPointsTimelineDisplay />
            {/if}
        </div>
        <div class="seeker" style={`left: ${seekerProgressPercent}`}>
            <div class="head"><Icon name={'create_seeker_head'} /></div>
            <div class="tail" />
        </div>
    </div>
    <div
        on:click={onClickTimeline}
        on:mousedown={onMouseDownTimeline}
        on:mouseup={mouseOffTimeline}
        on:mouseleave={mouseOffTimeline}
        on:mouseout={mouseOffTimeline}
        on:blur={mouseOffTimeline}
        on:mousemove={mouseMoveOnTimeline}
        class="timeline-click-container"
    />
    {#if $createEditorDisabled}
        <div class="disable-overlay" />
    {/if}
</main>

<style>
    main {
        height: 100%;
        width: 100%;
        position: relative;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 20px 1fr;
        padding: var(--timeline-padding);
        user-select: none;
    }

    div.disable-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.4;
        background: repeating-linear-gradient(
            -45deg,
            var(--color-blue-dark),
            var(--color-blue-dark) 5px,
            black 5px,
            black 25px
        );
        animation: disable-anim 1s linear infinite;
        z-index: 30;
        cursor: wait;
    }

    @keyframes disable-anim {
        0% {
            transform: scale(1.5) translateX(-35px);
        }
        100% {
            transform: scale(1.5) translateX(0%);
        }
    }

    div.timeline-click-container {
        position: absolute;
        width: calc(100% - var(--timeline-padding) * 2);
        height: calc(100% - var(--timeline-padding) * 2);
        top: 0;
        left: 0;
        margin: var(--timeline-padding);
        z-index: 10;
    }

    div.timeline-container {
        grid-column: 1 / -1;
        grid-row: 2 / -1;
        display: grid;
        position: relative;
        grid-template-columns: 1fr;
        grid-template-rows: min(74px, 7vh) 1fr 50px;
        grid-template-areas:
            'thumbnails'
            'keyframes'
            'waveform';
        background-color: var(--color-gray-1000);
        border: 1px solid var(--color-gray-500);
        /* border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px; */
        min-height: 0;
    }

    div.lines {
        grid-column: 1 / -1;
        grid-row: 1 / 2;
        position: relative;
    }

    div.lines div.timestamp {
        position: absolute;
        top: 0;
        font-size: 12px;
        padding: 2px;
        color: var(--color-gray-500);
        cursor: default;
    }

    div.lines div.timestamp.left {
        left: 4px;
    }

    div.lines div.timestamp.right {
        right: 4px;
    }

    div.lines div.lines-container {
        display: grid;
        grid-template-columns: repeat(20, 1fr);
        grid-template-rows: 1fr;
        justify-content: space-between;
        align-items: center;
        border-right: 1px solid var(--color-gray-500);
        width: 100%;
        height: 100%;
    }

    div.lines div.lines-container div.line {
        width: 1px;
        height: 100%;
        background-color: var(--color-gray-500);
    }

    div.thumbnails {
        grid-area: thumbnails;
        padding: var(--thumbs-padding);
        height: 100%;
        width: calc(100% - var(--thumbs-padding));
        overflow: hidden;
        min-height: 0;
        gap: var(--thumbs-padding);
        height: 100%;
        display: flex;
    }

    div.thumbnails img {
        height: 100%;
        width: auto;
        object-fit: cover;
    }

    div.keyframes {
        grid-area: keyframes;
    }

    div.waveform {
        grid-area: waveform;
        position: relative;
    }

    div.seeker {
        position: absolute;
        --seeker-head-height: 20px;
        height: calc(100% + var(--seeker-head-height));
        top: calc(-1 * var(--seeker-head-height));
        left: 0%;
        --seeker-color: var(--color-yellow-light);
        color: var(--seeker-color);
        font-size: var(--seeker-head-height);
        z-index: 5;
        transform: translateX(-2px);
    }

    div.seeker div.head {
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
    }

    div.seeker div.tail {
        width: 2px;
        height: 100%;
        background-color: var(--seeker-color);
    }
    
    div.timeline-overlays, div.timeline-underlays {
        position: absolute;
        width: 100%;
        height: 100%;
    }
    
    div.timeline-overlays {
        z-index: 4;
    }

    div.timeline-underlays div.timeline-warning-text {
        color: var(--color-gray-700);
        font-weight: bold;
        font-size: 1.5rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    
</style>

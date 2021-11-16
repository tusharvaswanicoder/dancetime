<script>
    import {
        createVideo,
        createAudio,
        createVideoCurrentTime,
        createVideoDuration,
        createVideoFPS
    } from '../stores';
    import { ConvertDurationToNiceStringWithFPS } from '../utils';

    let width = 0;
    let progressBarPercent = 0;

    const onClickProgressBar = (e) => {
        const percentClick = e.layerX / width;
        $createVideo.currentTime = percentClick * $createVideoDuration;
        $createAudio.currentTime = percentClick * $createVideoDuration;
        createVideoCurrentTime.set($createVideo.currentTime);
    };

    const GetProgressBarPercent = () => {
        if (!$createVideoCurrentTime || !$createVideoDuration) {
            return 0;
        }

        return ($createVideoCurrentTime / $createVideoDuration) * 100;
    };

    let mouseDownOnSeeker = false;
    const onMouseDownSeeker = (e) => {
        mouseDownOnSeeker = true;
    };
    
    const mouseMoveOnSeeker = (e) => {
        if (mouseDownOnSeeker) {
            onClickProgressBar(e);
        }
    }

    const mouseOffSeeker = () => {
        mouseDownOnSeeker = false;
    };

    $: {
        $createVideo,
            $createVideoCurrentTime,
            (progressBarPercent = GetProgressBarPercent());
    }
</script>

<main>
    {#if $createVideo}
        <div>{ConvertDurationToNiceStringWithFPS($createVideoCurrentTime, $createVideoFPS)}</div>
        <div
            bind:clientWidth={width}
            class="progress"
            on:click={onClickProgressBar}
            on:mousedown={onMouseDownSeeker}
            on:mouseup={mouseOffSeeker}
            on:mouseleave={mouseOffSeeker}
            on:mouseout={mouseOffSeeker}
            on:blur={mouseOffSeeker}
            on:mousemove={mouseMoveOnSeeker}
        >
            <div style={`width: ${progressBarPercent}%`} />
        </div>
        <div>{ConvertDurationToNiceStringWithFPS($createVideoDuration, $createVideoFPS)}</div>
    {/if}
</main>

<style>
    main {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        color: var(--color-gray-300);
        font-size: 1rem;
        margin-bottom: 6px;
        margin-top: 12px;
        cursor: default;
    }

    div.progress,
    div.progress div {
        height: 6px;
        background-color: var(--color-gray-500);
        border-radius: 50px;
        width: 100%;
    }

    div.progress div {
        background-color: var(--color-yellow-light);
    }
</style>

<script>
    import { onDestroy, onMount } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { linear } from 'svelte/easing';
    import {
        createVideoPlayer,
        createProject,
        createVideoCurrentTime
    } from '../stores';
    import { ConvertDurationToNiceStringWithDecimal } from '../utils';

    let width = 0;
    let progressBarPercent = 0;

    const onClickProgressBar = (e) => {
        // const percentClick = e.layerX / width;
        // $createVideo.currentTime = percentClick * $createProject.duration;
        // $createAudio.currentTime = percentClick * $createProject.duration;
        // createVideoCurrentTime.set($createVideo.currentTime);
    };

    const GetProgressBarPercent = () => {
        if (!$createVideoCurrentTime || !$createProject.duration) {
            return 0;
        }

        return ($createVideoCurrentTime / $createProject.duration) * 100;
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

    const tweenedTime = tweened(0, {
        duration: 20,
        easing: linear
    })

    $: {
        $createVideoCurrentTime = $tweenedTime;
    }

    let raf;
    const onFrame = async () => {
        const currentTime = await $createVideoPlayer.getCurrentTime();
        tweenedTime.set(currentTime);
        raf = window.requestAnimationFrame(onFrame);
    }

    onMount(() => {
        $createVideoCurrentTime = 0;
        onFrame();
    })

    onDestroy(() => {
        if (raf) {
            window.cancelAnimationFrame(raf);
        }
    })

    $: {
        $createVideoCurrentTime,
        (progressBarPercent = GetProgressBarPercent());
    }
</script>

<main>
    {#if $createVideoPlayer}
        <div>{ConvertDurationToNiceStringWithDecimal($createVideoCurrentTime)}</div>
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
        <div>{ConvertDurationToNiceStringWithDecimal($createProject.duration)}</div>
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

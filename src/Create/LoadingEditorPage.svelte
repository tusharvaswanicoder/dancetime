<script>
    import { fly, fade } from 'svelte/transition';
    import { streamManager } from '../Streaming/StreamingManager';
    import {
        createLoadingThumbnailsPercent,
        createLoadingMediaPercent,
        createProject,
        createMediaLoaded,
        createLoadingFinished,
    } from '../stores';
    import ProgressCircle from '../ProgressCircle.svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    let media_load_progress = tweened(0, {
        duration: 1000,
        easing: cubicOut,
    });

    const refreshDownloadStatus = async () => {
        
        isDownloaded = streamManager.isMediaDownloaded($createProject.media_id);
        if (!isDownloaded && !streamManager.isMediaDownloading($createProject.media_id)) {
            streamManager.startMediaDownload($createProject.media_id);
        }
        
        $createLoadingMediaPercent =
            streamManager.getMediaPercentComplete($createProject.media_id) /
            100;
            
        setTimeout(() => {
            media_load_progress.set($createLoadingMediaPercent);
        }, 500);
    };

    $: {
        $createMediaLoaded = $media_load_progress == 1;
    }

    let isDownloaded = false;
    $: {
        $streamManager, refreshDownloadStatus();
    }

    const stops = [
        { color: 'var(--color-yellow-dark)', offset: '0' },
        { color: 'var(--color-yellow-light)', offset: '1' },
    ];

    let load_progress = tweened(0, {
        duration: 400,
        easing: cubicOut,
    });

    $: {
        load_progress.set(
            ($createLoadingThumbnailsPercent * 0.5 +
                $media_load_progress * 0.5) *
                100
        );
    }

    $: {
        if ($load_progress >= 100) {
            $createLoadingFinished = true;
        }
    }
</script>

<main
    out:fade|local={{ delay: 1000 }}
    in:fly|local={{ x: 500, duration: 200, delay: 200 }}
>
    <span>Loading your project...</span>
    <div class="circle-container">
        <ProgressCircle {stops} value={$load_progress}>
            <span>{Math.ceil($load_progress)}%</span>
        </ProgressCircle>
    </div>
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: var(--color-gray-900);
        z-index: 9;
        display: flex;
        gap: 20px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    main > span {
        color: var(--color-gray-300);
        cursor: default;
    }

    div.circle-container {
        width: 120px;
        height: 120px;
        --progress-trackcolor: var(--color-gray-700);
        --progress-color: var(--color-blue-dark);
    }

    div.circle-container span {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: fit-content;
        height: fit-content;
        margin: auto;
        font-weight: 700;
        font-size: 20px;
        cursor: default;
        color: var(--color-yellow-light);
    }
</style>

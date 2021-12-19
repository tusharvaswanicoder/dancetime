<script>
    import { onMount, onDestroy } from 'svelte';
    import { GetMediaBlobFromDB } from '../Downloads/VideoBlobManager';
    import { dlManager } from '../Downloads/DownloadManager';
    import {
        ingameCanvas,
        ingameCTX,
        ingameVideo,
        ingameVideoURL,
        ingameAudio,
        ingameAudioURL,
        playGameMetadata,
        ingameTime,
        ingameEvalScreenShouldShow
    } from '../stores';
    import { drawImageProp } from '../utils';
    
    const animationCallback = () => {
        if ($ingameVideo && !$ingameEvalScreenShouldShow) {
            drawImageProp($ingameCTX, $ingameVideo);
            window.requestAnimationFrame(animationCallback);
        }

        if ($ingameVideo && $ingameVideo.ended) {
            $ingameVideo.currentTime = $ingameVideo.duration - 0.001;
            $ingameVideo.pause();
        }
    };

    const updateVideoURL = () => {
        if (!$playGameMetadata || !$playGameMetadata.media_id) {
            return;
        }
        
        $ingameVideoURL = dlManager.metaData[$playGameMetadata.media_id]['video_url'];
    };

    const updateAudioURL = () => {
        if (!$playGameMetadata || !$playGameMetadata.media_id) {
            return;
        }

        $ingameAudioURL = dlManager.metaData[$playGameMetadata.media_id]['audio_url'];
    };

    const onVideoPlay = () => {
        $ingameAudio.currentTime = $ingameVideo.currentTime;
        $ingameAudio.volume = 0.2;
        $ingameAudio.play();
    };

    const onVideoPause = () => {
        $ingameAudio.currentTime = $ingameVideo.currentTime;
        $ingameAudio.pause();
    };

    const refreshCTX = (canvas) => {
        if (!canvas) {
            return;
        }

        $ingameCTX = canvas.getContext('2d');
    };
    
    onMount(() => {
        refreshCTX($ingameCanvas);
        updateVideoURL(), updateAudioURL();
        animationCallback();
        $ingameAudio.volume = 0;
    });

    onDestroy(() => {
        $ingameVideoURL = null;
        $ingameAudioURL = null;
    });
</script>

<main>
    <!-- TODO: currently you can right click and download the video... -->
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
        preload="metadata"
        bind:this={$ingameVideo}
        bind:currentTime={$ingameTime}
        on:play={onVideoPlay}
        on:pause={onVideoPause}
        on:contextmenu|preventDefault|stopPropagation
        on:click|preventDefault|stopPropagation
        src={$ingameVideoURL}
        controls={false}
        muted={true}
        disablePictureInPicture
    />
    <audio
        bind:this={$ingameAudio}
        src={$ingameAudioURL}
        on:contextmenu|preventDefault
        controls={false}
    />
    <canvas
        width={1920}
        height={1080}
        bind:this={$ingameCanvas}
        on:contextmenu|preventDefault
    />
</main>

<style>
    main {
        position: relative;
        display: grid;
        place-items: center;
        background-color: black;
        height: 100%;
        width: 100%;
    }

    /* video,
    audio {
        display: none;
    }

    canvas {
        max-width: 100%;
        max-height: 100%;
    } */
    
    canvas, audio {
        display: none;
    }
    
    video {
        max-width: 100%;
        max-height: 100%;
    }
</style>

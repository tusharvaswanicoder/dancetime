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
    import { drawImageProp, GetKeypointsForFrame, GetFrameNumberFromTime } from '../utils';
    
    const animationCallback = () => {
        if ($ingameVideo && !$ingameEvalScreenShouldShow) {
            drawImageProp($ingameCTX, $ingameVideo);
            
            const keypoints = GetKeypointsForFrame($playGameMetadata.keypoints, GetFrameNumberFromTime($ingameTime, $playGameMetadata.fps));
            
            window.requestAnimationFrame(animationCallback);
        }

        if ($ingameVideo && $ingameVideo.ended) {
            $ingameVideo.currentTime = $ingameVideo.duration - 0.001;
            $ingameVideo.pause();
        }
    };

    const updateVideoBlobURL = () => {
        if (!$playGameMetadata || !$playGameMetadata.media_id) {
            return;
        }

        const blob_name =
            dlManager.metaData[$playGameMetadata.media_id]['indexedMediaBlob-v'];

        if (!blob_name) {
            return;
        }

        GetMediaBlobFromDB(blob_name, (blob) => {
            $ingameVideoURL = URL.createObjectURL(blob);
        });
    };

    const updateAudioBlobURL = () => {
        if (!$playGameMetadata || !$playGameMetadata.media_id) {
            return;
        }

        const blob_name =
            dlManager.metaData[$playGameMetadata.media_id]['indexedMediaBlob-a'];

        if (!blob_name) {
            return;
        }

        GetMediaBlobFromDB(blob_name, (blob) => {
            $ingameAudioURL = URL.createObjectURL(blob);
        });
    };

    const onVideoPlay = () => {
        $ingameAudio.volume = 0.2;
        $ingameAudio.play();
    };

    const onVideoPause = () => {
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
        updateVideoBlobURL(), updateAudioBlobURL();
        animationCallback();
        $ingameAudio.volume = 0;
    });

    onDestroy(() => {
        URL.revokeObjectURL($ingameVideoURL);
        URL.revokeObjectURL($ingameAudioURL);
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

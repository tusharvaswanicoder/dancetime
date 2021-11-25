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
        playGameMetadata
    } from '../stores';
    import { drawImageProp } from '../utils';

    const animationCallback = () => {
        if ($ingameVideo) {
            drawImageProp($ingameCTX, $ingameVideo);
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
        $ingameAudio.play();
        $ingameAudio.volume = 0.05;
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
    });

    onDestroy(() => {
        URL.revokeObjectURL($ingameVideoURL);
        URL.revokeObjectURL($ingameAudioURL);
        $ingameVideoURL = null;
        $ingameAudioURL = null;
    });
</script>

<main>
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
        preload="metadata"
        bind:this={$ingameVideo}
        on:play={onVideoPlay}
        on:pause={onVideoPause}
        on:contextmenu|preventDefault
        src={$ingameVideoURL}
        controls
        muted
        disablePictureInPicture
    />
    <audio
        bind:this={$ingameAudio}
        src={$ingameAudioURL}
        on:contextmenu|preventDefault
        controls
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
        display: grid;
        place-items: center;
        background-color: black;
        height: 100%;
        width: 100%;
    }

    video,
    audio {
        display: none;
    }

    canvas {
        max-width: 100%;
        max-height: 100%;
    }
</style>

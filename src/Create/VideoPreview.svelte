<script>
    import { onMount, tick, onDestroy } from 'svelte';
    import { GetMediaBlobFromDB } from '../Downloads/VideoBlobManager';
    import { dlManager } from '../Downloads/DownloadManager';
    import {
        createCanvas,
        createCTX,
        createVideo,
        createAudio,
        createVideoCurrentTime,
        createVideoDuration,
        createProject,
        createEditorDisabled,
        createAAInProgress
    } from '../stores';
    import { drawImageProp } from '../utils';
    import projectManager from "./ProjectManager"
    export let onVideoPaused = () => {};
    export let onVideoPlayed = () => {};

    let videoURL;
    let audioURL;

    const animationCallback = () => {
        // if (!$createVideo) {return false;}

        // if ($createVideo.paused) {
        //     if ($createVideo.currentTime == $createVideo.duration && lastFrameLoaded) {
        //         return false;
        //     } else if ($createVideo.paused && firstFrameLoaded) {
        //         return false;
        //     }
        // }

        // ctx.drawImage(video, 0, 0, video.videoWidth,    video.videoHeight,     // source rectangle
        //                    0, 0, ctx.canvas.width, ctx.canvas.height); // destination rectangle

        // Wait until it has rendered a frame so it displays the first frame
        // if (!firstFrameLoaded && $createVideo.currentTime > 0) {
        //     firstFrameLoaded = true;
        //     $createVideo.currentTime = 0;
        // }
        if ($createVideo) {
            drawImageProp($createCTX, $createVideo);
            window.requestAnimationFrame(animationCallback);
        }

        if ($createVideo && $createVideo.ended) {
            $createVideo.currentTime = $createVideo.duration - 0.001;
            $createVideo.pause();
        }
    };

    const updateVideoBlobURL = () => {
        if (!$createProject || !$createProject.media_id) {
            return;
        }

        const blob_name =
            dlManager.metaData[$createProject.media_id]['indexedMediaBlob-v'];

        if (!blob_name) {
            return;
        }

        GetMediaBlobFromDB(blob_name, (blob) => {
            videoURL = URL.createObjectURL(blob);
        });
    };

    const updateAudioBlobURL = () => {
        if (!$createProject || !$createProject.media_id) {
            return;
        }

        const blob_name =
            dlManager.metaData[$createProject.media_id]['indexedMediaBlob-a'];

        if (!blob_name) {
            return;
        }

        GetMediaBlobFromDB(blob_name, (blob) => {
            audioURL = URL.createObjectURL(blob);
        });
    };

    const onVideoPlay = () => {
        $createAudio.play();
        $createAudio.volume = 0.05;
        // animationCallback();
        onVideoPaused();
    };

    const onVideoSeeked = () => {
        // animationCallback();
    };

    const onVideoPause = () => {
        $createAudio.pause();
        onVideoPlayed();
    };

    const refreshCTX = (canvas) => {
        if (!canvas) {
            return;
        }

        $createCTX = canvas.getContext('2d');
    };
    
    // This is where all conditions for the editor being disabled should go. Puts the blue lines over the controls and timeline.
    $: {
        $createEditorDisabled = $createAAInProgress
    }
    
    onMount(() => {
        refreshCTX($createCanvas), animationCallback();
        updateVideoBlobURL(), updateAudioBlobURL();
    });

    onDestroy(() => {
        URL.revokeObjectURL(videoURL);
        URL.revokeObjectURL(audioURL);
    });
</script>

<main>
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
        preload="metadata"
        bind:this={$createVideo}
        on:play={onVideoPlay}
        on:pause={onVideoPause}
        on:seeked={onVideoSeeked}
        on:contextmenu|preventDefault
        bind:currentTime={$createVideoCurrentTime}
        bind:duration={$createVideoDuration}
        src={videoURL}
        controls
        muted
        disablePictureInPicture
    />
    <audio
        bind:this={$createAudio}
        src={audioURL}
        on:contextmenu|preventDefault
        controls
    />
    <canvas
        width={1920}
        height={1080}
        bind:this={$createCanvas}
        on:contextmenu|preventDefault
    />
</main>

<style>
    video,
    audio {
        display: none;
    }

    canvas {
        width: min(100%, 105vh);
        height: auto;
        border-radius: 20px;
    }
</style>

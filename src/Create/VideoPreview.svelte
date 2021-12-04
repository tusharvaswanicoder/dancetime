<script>
    import { onMount, onDestroy } from 'svelte';
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
        createAAInProgress,
        createTabState
    } from '../stores';
    import { EDITOR_TAB_STATE } from '../constants';
    import { drawImageProp } from '../utils';
    import { drawKeypointsAndSkeleton } from './DrawKeypoints';
    import { GetKeypointsForFrame, GetFrameNumberFromTime } from '../utils';
    export let onVideoPaused = () => {};
    export let onVideoPlayed = () => {};

    let videoURL;
    let audioURL;
    let seeking = false;
    
    // onSeeked fires twice when seeking - once when dragging there, and another when mouse off
    // FUTURE TODO: fix this so that there aren't a bunch of skeletons drawn when scrubbing the timeline
    const onSeeked = (e) => {
        seeking = false;
    }
    
    const onSeeking = () => {
        seeking = true;
    }
    
    const animationCallback = () => {
        if ($createVideo && $createProject) {
            drawImageProp($createCTX, $createVideo);
            
            if ($createTabState == EDITOR_TAB_STATE.REVIEW && !$createAAInProgress && !seeking) {
                const currentFrame = GetFrameNumberFromTime($createVideo.currentTime, $createProject.fps);
                
                if (Object.keys($createProject.keypoints).length > 0) {
                    const keypoints_obj = GetKeypointsForFrame($createProject.keypoints, currentFrame);
                    
                    if (keypoints_obj && keypoints_obj.keypoints) {
                        drawKeypointsAndSkeleton($createCTX, keypoints_obj.keypoints);
                    }
                }
                
            }
            
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
        on:seeked={onSeeked}
        on:seeking={onSeeking}
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
        margin-left: auto;
        margin-right: auto;
    }
</style>

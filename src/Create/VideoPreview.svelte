<script>
    import YouTubePlayer from 'youtube-player';
    import { onDestroy, onMount } from 'svelte';
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
        createTabState,
        createVideoPlayer
    } from '../stores';
    import { EDITOR_TAB_STATE } from '../constants';
    import { drawImageProp } from '../utils';
    import { drawKeypointsAndSkeleton } from './DrawKeypoints';
    import { GetKeypointsForFrame, GetFrameNumberFromTime } from '../utils';

    const animationCallback = () => {
        // if ($createProject) {
        //     $createCTX.clearColor(0, 0, 0, 0);
        //     if ($createTabState == EDITOR_TAB_STATE.REVIEW && !$createAAInProgress) {
        //         const currentFrame = GetFrameNumberFromTime($createVideo.currentTime, $createProject.fps);
                
        //         if (Object.keys($createProject.keypoints).length > 0) {
        //             const keypoints_obj = GetKeypointsForFrame($createProject.keypoints, currentFrame);
                    
        //             if (keypoints_obj && keypoints_obj.keypoints) {
        //                 drawKeypointsAndSkeleton($createCTX, keypoints_obj.keypoints);
        //             }
        //         }
                
        //     }
            
        //     window.requestAnimationFrame(animationCallback);
        // }
    };

    const video_div_id = 'create-youtube-video';

    onMount(() => {
        $createVideoPlayer = YouTubePlayer(video_div_id, {
            playerVars: {
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                modestbranding: 1,
                origin: document.domain,
                rel: 0,
                showinfo: 0,
                frameborder: 0,
                iv_load_policy: 3
            },
            width: 1920,
            height: 1080
        });
        $createVideoPlayer.loadVideoById($createProject.video_id);
    })

    onDestroy(() => {
        if ($createVideoPlayer) {
            $createVideoPlayer = $createVideoPlayer.destroy();
        }
    })

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
    });
</script>

<main>
    <div id={video_div_id}></div>
    <canvas
        width={1920}
        height={1080}
        bind:this={$createCanvas}
        on:contextmenu|preventDefault
    />
</main>

<style>
    main {
        position: relative;
        width: min(100%, 105vh);
        height: auto;
        border-radius: 20px;
        margin-left: auto;
        margin-right: auto;
        aspect-ratio: 16 / 9;
        overflow: hidden;
    }

    canvas, #create-youtube-video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>

<script>
    import YouTubePlayer from 'youtube-player';
    import { onMount, onDestroy } from 'svelte';
    import {
        ingameVideoPlayer,
        playGameMetadata
    } from '../stores';
    import { GetVideoStartAndEndTimeFromMetadata } from '../utils';
    
    const video_div_id = 'ingame-youtube-video';
    onMount(() => {
        const startEndTime =
            GetVideoStartAndEndTimeFromMetadata($playGameMetadata);
        $ingameVideoPlayer = YouTubePlayer(video_div_id, {
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
                iv_load_policy: 3,
                start: Math.floor(startEndTime.start),
                end: Math.ceil(startEndTime.end)
            },
            videoId: $playGameMetadata.video_id,
            width: 1920,
            height: 1080,
        });
    })

    onDestroy(() => {
        if ($ingameVideoPlayer) {
            $ingameVideoPlayer = $ingameVideoPlayer.destroy();
        }
    })

</script>

<main>
    <div id={video_div_id}></div>
    <div class='overlay'></div>
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

    div.overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    /* video,
    audio {
        display: none;
    }

    canvas {
        max-width: 100%;
        max-height: 100%;
    } */
    
    #ingame-youtube-video {
        max-width: 100%;
        max-height: 100%;
    }
</style>

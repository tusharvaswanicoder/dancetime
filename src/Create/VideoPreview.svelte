<script>
    import { onMount, tick, onDestroy } from 'svelte';
    import { GetVideoBlobFromDB } from '../Downloads/VideoBlobManager';
    import { dlManager } from '../Downloads/DownloadManager';
    import { createCanvas, createVideo, createAudio, createVideoCurrentTime, createVideoDuration } from '../stores';
    export let project;
    export let onVideoPaused = () => {};
    export let onVideoPlayed = () => {};
    
    let ctx;
    let videoURL;
    let audioURL;

    /**
     * By Ken Fyrstenberg Nilsen
     *
     * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
     *
     * If image and context are only arguments rectangle will equal canvas
     */
    function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
        if (arguments.length === 2) {
            x = y = 0;
            w = ctx.canvas.width;
            h = ctx.canvas.height;
        }

        // default offset is center
        offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
        offsetY = typeof offsetY === 'number' ? offsetY : 0.5;

        // keep bounds [0.0, 1.0]
        if (offsetX < 0) offsetX = 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetX > 1) offsetX = 1;
        if (offsetY > 1) offsetY = 1;

        var iw = img.videoWidth,
            ih = img.videoHeight,
            r = Math.min(w / iw, h / ih),
            nw = iw * r, // new prop. width
            nh = ih * r, // new prop. height
            cx,
            cy,
            cw,
            ch,
            ar = 1;

        // decide which gap to fill
        if (nw < w) ar = w / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
        nw *= ar;
        nh *= ar;

        // calc source rectangle
        cw = iw / (nw / w);
        ch = ih / (nh / h);

        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;

        // make sure source rectangle is valid
        if (cx < 0) cx = 0;
        if (cy < 0) cy = 0;
        if (cw > iw) cw = iw;
        if (ch > ih) ch = ih;

        // fill image in dest. rectangle
        ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
    }

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
            drawImageProp(ctx, $createVideo);
            window.requestAnimationFrame(animationCallback);
        }
        
        if ($createVideo && $createVideo.ended) {
            $createVideo.currentTime = $createVideo.duration - 0.001;
            $createVideo.pause();
        }
    };

    const updateVideoBlobURL = () => {
        if (!project) {
            return;
        }

        const blob_name =
            dlManager.metaData[project.media_id]['indexedMediaBlob-v'];
        
        if (!blob_name) {
            return;
        }
        
        GetVideoBlobFromDB(blob_name, (blob) => {
            videoURL = URL.createObjectURL(blob);
        });
    };

    const updateAudioBlobURL = () => {
        if (!project) {
            return;
        }

        const blob_name =
            dlManager.metaData[project.media_id]['indexedMediaBlob-a'];
            
        if (!blob_name) {
            return;
        }    
        
        GetVideoBlobFromDB(blob_name, (blob) => {
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

    $: {
        project, updateVideoBlobURL(), updateAudioBlobURL();
    }

    onMount(() => {
        ctx = $createCanvas.getContext('2d');
        animationCallback();
    });
    
    onDestroy(() => {
        URL.revokeObjectURL(videoURL);
        URL.revokeObjectURL(audioURL);
    })
    
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
    <canvas width={1920} height={1080} bind:this={$createCanvas} on:contextmenu|preventDefault />
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

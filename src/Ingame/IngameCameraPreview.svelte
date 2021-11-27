<script>
    import { onMount } from "svelte";
    import { drawImageProp } from '../utils';
    import { playGameCameraStream, ingameCamera, ingameCameraCanvas } from "../stores";

    // Use a canvas so we can flip the webcam horizontally
    let ingameCameraCTX;
    
    // Update canvas on frame to use mirrored version in TFJS
    const onFrame = () => {
        if ($ingameCamera.readyState == 4) {
            ingameCameraCTX.translate($ingameCamera.videoWidth, 0);
            ingameCameraCTX.scale(-1, 1);
            drawImageProp(ingameCameraCTX, $ingameCamera);
            ingameCameraCTX.setTransform(1,0,0,1,0,0);
        }
        
        window.requestAnimationFrame(onFrame);
    }

    onMount(() => {
        $ingameCamera.srcObject = $playGameCameraStream;
        ingameCameraCTX = $ingameCameraCanvas.getContext('2d');
        onFrame();
    });
</script>

<main>
    <video
        bind:this={$ingameCamera}
        on:contextmenu|preventDefault
        autoplay
        muted
        disablePictureInPicture
    />
    <canvas 
        width={1920}
        height={1080}
        bind:this={$ingameCameraCanvas}
        on:contextmenu|preventDefault
    />
</main>

<style>
    main {
        position: absolute;
        bottom: 0;
        left: 0;
        margin: 16px;
        border-radius: 16px;
        width: 40vh;
        max-width: 25%;
        overflow: hidden;
    }

    video {
        width: 100%;
        height: auto;
        transform: scaleX(-1);
    }
    
    canvas {
        display: none;
        width: 100%;
        height: auto;
    }
</style>

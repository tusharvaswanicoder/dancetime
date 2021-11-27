<script>
    import { onMount } from "svelte";
    import { playGameCameraStream, ingameCamera } from "../stores";


    onMount(() => {
        $ingameCamera.srcObject = $playGameCameraStream;
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
    }
</style>

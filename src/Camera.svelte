<script>
    import { onMount, onDestroy } from "svelte";
    import { cameraStore, cameraCanvasStore } from "./stores.js";
    export let width, height;
    import {
        GetVideoBlobFromURL,
        StoreVideoBlob,
        GetVideoBlobFromDB,
    } from "./VideoBlobManager";

    let enableWebcam = true;

    $: {
        enableWebcam, RefreshWebcamStream();
    }

    function RefreshWebcamStream() {
        if (!enableWebcam) {
            return;
        }

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                // TEMP: only use this device id in localhost for correct camera
                // or keep because it still allows you to choose camera if this one doesn't exist
                .getUserMedia({
                    video: {
                        deviceId:
                            "8Icmu55xfG41JYbpcguRkmmGPzMEPXjeW6Ksp30PA10=",
                    },
                })
                .then(function (stream) {
                    $cameraStore.srcObject = stream;
                    console.log(`Camera loaded`);
                })
                .catch(function (error) {
                    console.log(`Failed to get webcam: ${error}`);
                    $cameraStore = null;
                });
        }
    }

    let blobinvideo;

    function GetVideoStuff() {
        GetVideoBlobFromDB("testblob", (blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                $cameraStore.src = url;
            }
        });
    }

    onMount(() => {
        RefreshWebcamStream();
    });
</script>

<div class="camera-container">
    <canvas bind:this={$cameraCanvasStore} {width} {height} />
    <!-- svelte-ignore a11y-media-has-caption -->
    {#if enableWebcam}
        <video autoplay bind:this={$cameraStore} {width} {height} />
    {:else}
        <video autoplay muted bind:this={$cameraStore} {width} {height} />
    {/if}
</div>

<button on:click={() => (enableWebcam = !enableWebcam)}>
    {#if enableWebcam}
        Use Video
    {:else}
        Use Webcam
    {/if}
</button>

<button
    on:click={() =>
        $cameraStore.paused ? $cameraStore.play() : $cameraStore.pause()}
    >Play/Pause Video</button
>

<button on:click={() => GetVideoStuff()}>Get Video Stuff</button>

<style>
    div.camera-container {
        overflow: hidden;
    }

    canvas {
        position: absolute;
    }

    video {
        /* border: 2px solid red; */
    }
</style>

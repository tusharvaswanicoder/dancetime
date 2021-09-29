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
    
    let preferred_camera_info = null;

    function RefreshWebcamStream() {
        if (!enableWebcam) {
            return;
        }

        if (!preferred_camera_info)
        {
            // TIP: once access has been allowed to video devices, all labels are shown :)
            navigator.mediaDevices
            .enumerateDevices()
            .then(function (devices) {
                devices.forEach(function (device) {
                    // console.log(
                    //     device.kind +
                    //         ": " +
                    //         device.label +
                    //         " id = " +
                    //         device.deviceId
                    // );
                    
                    if (device.label == "OBS Virtual Camera")
                    {
                        preferred_camera_info = device;
                    }
                });
                RefreshWebcamStream();
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
            });
            return;
        }

        if (navigator.mediaDevices.getUserMedia) {
            console.log(preferred_camera_info)
            navigator.mediaDevices
                // TEMP: only use this device id in localhost for correct camera
                // or keep because it still allows you to choose camera if this one doesn't exist
                .getUserMedia({
                    video: {
                        deviceId: preferred_camera_info.deviceId,
                    },
                    // video: true,
                })
                .then(function (stream) {
                    if ("srcObject" in $cameraStore) {
                        $cameraStore.srcObject = stream;
                    } else {
                        // Avoid using this in new browsers, as it is going away.
                        $cameraStore.src = URL.createObjectURL(stream);
                    }
                    console.log(`Camera loaded`);
                })
                .catch(function (error) {
                    console.log(`Failed to get webcam: ${error}`);
                    $cameraStore = null;
                });
        }
    }

    // https://dl.dancetime.io/video/lipa.mp4

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

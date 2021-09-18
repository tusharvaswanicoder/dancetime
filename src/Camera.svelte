<script>
    import { onMount } from "svelte";
    import { cameraStore, cameraCanvasStore } from "./stores.js"
    export let width, height;
    
    onMount(() => 
    {
		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
			// TEMP: only use this device id in localhost for correct camera
			// or keep because it still allows you to choose camera if this one doesn't exist
				.getUserMedia({ video: {deviceId: "8Icmu55xfG41JYbpcguRkmmGPzMEPXjeW6Ksp30PA10="} })
				.then(function (stream) {
					$cameraStore.srcObject = stream;
                    console.log(`Camera loaded`);
				})
				.catch(function (error) {
					console.log(`Failed to get webcam: ${error}`);
                    $cameraStore = null;
				});
		}
    })
</script>

<div class='camera-container'>
    <canvas bind:this={$cameraCanvasStore} {width} {height}></canvas>
	<!-- svelte-ignore a11y-media-has-caption -->
    <video autoplay bind:this={$cameraStore} {width} {height}></video>
</div>

<style>
    
    div.camera-container {
        overflow: hidden;
    }
    
    canvas {
        position: absolute;
        background-color: rgba(255, 0, 0, 0.2);
    }
    
	video {
		/* border: 2px solid red; */
	}

</style>
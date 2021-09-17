<script>
    import { onMount } from "svelte";
    export let width, height, camera, canvas = null;
    
    onMount(() => 
    {
		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
			// TEMP: only use this device id in localhost for correct camera
			// or keep because it still allows you to choose camera if this one doesn't exist
				.getUserMedia({ video: {deviceId: "8Icmu55xfG41JYbpcguRkmmGPzMEPXjeW6Ksp30PA10="} })
				.then(function (stream) {
					camera.srcObject = stream;
                    console.log(`Camera loaded!`);
				})
				.catch(function (error) {
					console.log(`Failed to get webcam: ${error}`);
				});
		}
    })
</script>

<div class='camera-container'>
    <canvas bind:this={canvas} {width} {height}></canvas>
	<!-- svelte-ignore a11y-media-has-caption -->
    <video autoplay bind:this={camera} {width} {height}></video>
</div>

<style>
    
    div.camera-container {
        position: relative;
        width: fit-content;
    }
    
    canvas {
        position: absolute;
        border: 2px solid red;
    }
    
	video {
		/* border: 2px solid red; */
		border-radius: 20px;
	}

</style>
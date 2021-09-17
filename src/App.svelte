<script>
	import { onMount } from "svelte";

	export let name;

	let camera;

	let mounted = false;
	let tfjsReady = false;
	onMount(() => {
		mounted = true;
		if (tfjsReady) {
			TFJSReadyAndMounted();
		}

		/*navigator.mediaDevices
			.enumerateDevices()
			.then(function (devices) {
				console.table(devices);
				devices.forEach(function (device) {
					console.log(
						device.kind +
							": " +
							device.label +
							" id = " +
							device.deviceId
					);
				});
			})
			.catch(function (err) {
				console.log(err.name + ": " + err.message);
			});*/
	});

	let tfjs_num_loaded = 0;
	function loadTFJS() {
		tfjs_num_loaded++;

		if (tfjs_num_loaded == 4) {
			tfjsReady = true;
			if (mounted) {
				TFJSReadyAndMounted();
			}
		}
	}

	function TFJSReadyAndMounted() {
		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
			// TEMP: only use this device id in localhost for correct camera
			// or keep because it still allows you to choose camera if this one doesn't exist
				.getUserMedia({ video: {deviceId: "8Icmu55xfG41JYbpcguRkmmGPzMEPXjeW6Ksp30PA10="} })
				.then(function (stream) {
					camera.srcObject = stream;
				})
				.catch(function (error) {
					console.log(`Failed to get webcam: ${error}`);
				});
		}
	}
</script>

<svelte:head>
	<script
		src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core"
		on:load={loadTFJS}></script>
	<script
		src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter"
		on:load={loadTFJS}></script>
	<script
		src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl"
		on:load={loadTFJS}></script>
	<script
		src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection"
		on:load={loadTFJS}></script>
</svelte:head>

<main>
	{#if camera && camera.srcObject}
		<p>Camera loaded! 😊</p>
	{:else}
		<p>Loading camera...</p>
	{/if}
	<!-- svelte-ignore a11y-media-has-caption -->
	<video autoplay="true" bind:this={camera} controls={false} width={1920 * 0.4} height={1080 * 0.4}/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	
	video {
		/* border: 2px solid red; */
		border-radius: 20px;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>

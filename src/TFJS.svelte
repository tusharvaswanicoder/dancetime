
<svelte:head>
	<script defer
		src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@3.9.0/dist/tf-core.min.js"
		on:load={loadTFJS}></script>
	<script defer
		src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@3.9.0/dist/tf-converter.min.js"
		on:load={loadTFJS}></script>
	<script defer
		src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@3.9.0/dist/tf-backend-webgl.min.js"
		on:load={loadTFJS}></script>
	<script defer
		src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@0.0.6/dist/pose-detection.min.js"
		on:load={loadTFJS}></script>
</svelte:head>

<script>
    
    import { createEventDispatcher, onMount } from 'svelte';
    const dispatch = createEventDispatcher();
    const loaded = () => dispatch('tfjs-loaded');
    
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
        loaded();
        console.log(poseDetection)
        // IT WORKS
	}
</script>
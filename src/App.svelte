<script>
	import { onMount } from "svelte";
	import Camera from "./Camera.svelte";
	import TFJS from "./TFJS.svelte";
	
	function handleTFJSLoaded() {
		console.log("TFJS loaded");
	}

</script>

<main>
	<p>Camera loaded! 😊</p>
	<Camera width={1920 * 0.4} height={1080 * 0.4}/>
	<TFJS on:tfjs-loaded={handleTFJSLoaded} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
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

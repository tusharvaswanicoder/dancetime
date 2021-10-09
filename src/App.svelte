<script>
    import Camera from './Camera.svelte';
    import TFJS from './TFJS.svelte';

    function handleTFJSLoaded() {
        console.log('TFJS loaded');
    }
</script>

<main>
    <p>Camera loaded! 😊</p>
    <Camera width={1920 * 0.5} height={1080 * 0.5} />
    <TFJS on:tfjs-loaded={handleTFJSLoaded} />
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        margin: 0 auto;
        /* width: fit-content; */
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    :global(*, *::before, *::after) {
        box-sizing: border-box;
    }
</style>

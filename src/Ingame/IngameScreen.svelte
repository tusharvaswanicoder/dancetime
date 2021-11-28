<script>
    import IngameVideo from './IngameVideo.svelte';
    import IngameCameraPreview from './IngameCameraPreview.svelte';
    import IngameLookahead from './IngameLookahead.svelte';
    import IngameScores from './IngameScores.svelte';
    import IngameTFJS from './IngameTFJS.svelte';
    
    import { testIngameScores } from '../stores';
    
</script>

<main>
    <IngameVideo />
    <IngameCameraPreview />
    <IngameLookahead />
    <IngameScores />
    <IngameTFJS />
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        /* cursor: none; */
    }
</style>
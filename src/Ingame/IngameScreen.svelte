<script>
    import IngameVideo from './IngameVideo.svelte';
    import IngameCameraPreview from './IngameCameraPreview.svelte';
    import IngameLookahead from './IngameLookahead.svelte';
    import IngameScores from './IngameScores.svelte';
    import IngameTFJS from './IngameTFJS.svelte';
    
    import { testIngameScores } from '../stores';
    
</script>

<main>
    <h1>{($testIngameScores)}</h1>
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
    
    h1 {
        color: yellow;
        font-weight: bold;
        font-size: 3rem;
        position: absolute;
        top: 0;
        left: 0;
        margin: 10px;
    }
</style>
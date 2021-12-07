<script>
    import IngameVideo from './IngameVideo.svelte';
    import IngameCameraPreview from './IngameCameraPreview.svelte';
    import IngameLookahead from './IngameLookahead.svelte';
    import IngameScores from './IngameScores.svelte';
    import IngameTFJS from './IngameTFJS.svelte';
    import {
        ingameTime,
        ingameVideo,
        playGameMetadata,
        ingameEvalScreenShouldShow,
        ingameScreenShouldShow,
    } from '../stores';
    import { GetVideoEndTimeFromMetadata } from '../utils';

    // Detect when song is over and show ingame eval screen
    $: {
        if (
            !$ingameEvalScreenShouldShow &&
            $ingameVideo &&
            $ingameTime >=
                GetVideoEndTimeFromMetadata($playGameMetadata)
        ) {
            $ingameEvalScreenShouldShow = true;
            $ingameVideo.pause;

            setTimeout(() => {
                $ingameScreenShouldShow = false;
            }, 1000);
        }
    }
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

<script>
    import IngameVideo from './IngameVideo.svelte';
    import IngameCameraPreview from './IngameCameraPreview.svelte';
    import IngameLookahead from './IngameLookahead.svelte';
    import IngameScores from './IngameScores.svelte';
    import IngameProgress from './IngameProgress.svelte';
    import IngameTFJS from './IngameTFJS.svelte';
    import {
        ingameTime,
        ingameVideo,
        playGameMetadata,
        ingameEvalScreenShouldShow,
        ingameScreenShouldShow,
        ingameShouldScore
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
            $ingameShouldScore = false;
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
    <section class='progress-and-scores'>
        <IngameProgress />
        <IngameScores />
    </section>
    <IngameTFJS />
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        /* cursor: none; */
    }
    
    section.progress-and-scores {
        position: absolute;
        min-width: fit-content;
        width: max(30%, 350px);
        max-width: 450px;
        height: fit-content;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        gap: 40px;
        max-height: 45%;
    }
</style>

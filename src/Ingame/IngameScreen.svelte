<script>
    import IngameVideo from './IngameVideo.svelte';
    import IngameCameraPreview from './IngameCameraPreview.svelte';
    import IngameLookahead from './IngameLookahead.svelte';
    import IngameScores from './IngameScores.svelte';
    import IngameProgress from './IngameProgress.svelte';
    import IngameTFJS from './IngameTFJS.svelte';
    import {
        ingameTime,
        ingameVideoPlayer,
        playGameMetadata,
        ingameEvalScreenShouldShow,
        ingameScreenShouldShow,
        ingameShouldScore,
        keyDown
    } from '../stores';
    import { ExitGame, GetVideoEndTimeFromMetadata } from '../utils';
    import { fade } from 'svelte/transition';

    // Detect when song is over and show ingame eval screen
    $: {
        if (
            !$ingameEvalScreenShouldShow &&
            $ingameTime >=
                GetVideoEndTimeFromMetadata($playGameMetadata)
        ) {
            $ingameShouldScore = false;
            $ingameEvalScreenShouldShow = true;
            $ingameVideoPlayer.pauseVideo();

            setTimeout(() => {
                $ingameScreenShouldShow = false;
            }, 1000);
        }
    }
    
    let holdingEscape = false;
    let holdingEscapeTimer;
    let holdingEscapeStopTimer;
    
    const onKeyDown = (e) => {
        if (e.key == "Escape") {
            // Continue holding escape to quit
            if (!holdingEscape) {
                holdingEscape = true;
                holdingEscapeTimer = setTimeout(() => {
                    ExitGame();
                    clearTimeout(holdingEscapeStopTimer);
                }, 3000);
            }
            
            if (holdingEscapeStopTimer) {
                clearTimeout(holdingEscapeStopTimer);
            }
            
            holdingEscapeStopTimer = setTimeout(() => {
                holdingEscape = false;
                if (holdingEscapeTimer) {
                    clearTimeout(holdingEscapeTimer);
                }
            }, 200);
        }
    }
    
    $: {
        onKeyDown($keyDown);
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
    {#if holdingEscape}
        <div class='exiting' transition:fade={{duration: 400}}>Continue holding escape to exit.</div>
    {/if}
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        /* cursor: none; */
    }
    
    div.exiting {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100px;
        color: white;
        font-weight: bold;
        font-size: 24px;
        background: linear-gradient(180deg, black, transparent);
        z-index: 100;
        display: grid;
        place-content: center;
        user-select: none;
    }
    
    section.progress-and-scores {
        position: absolute;
        min-width: fit-content;
        width: max(30%, 350px);
        max-width: 450px;
        height: fit-content;
        top: 0;
        left: 0;
        display: grid;
        grid-template-rows: 300px 1fr;
        gap: 20px;
        max-height: 45%;
    }
</style>

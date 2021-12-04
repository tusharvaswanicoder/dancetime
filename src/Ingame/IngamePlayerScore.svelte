<script>
import { onMount } from 'svelte';

    import { JUDGEMENT_VISUAL_FREQUENCY, JUDGEMENT_VISUALS } from './Scoring';
    import { ingameVideo } from '../stores';
    export let player_data = { name: 'Unknown' };
    
    let judgement_elem;
    let refreshTimeout;
    let currentJudgement;
    
    const refreshJudgementAnim = async () => {
        if (($ingameVideo && $ingameVideo.ended) || refreshTimeout) {
            return;
        }
        
        if (currentJudgement != player_data.judgement) {
            currentJudgement = player_data.judgement;
            if (judgement_elem && player_data.judgement) {
                judgement_elem.classList.remove('judgement_anim');
                // Magic line to refresh https://css-tricks.com/restart-css-animation/
                void judgement_elem.offsetWidth;
                judgement_elem.classList.add('judgement_anim');
            }
        }
        
        if (refreshTimeout) {
            clearTimeout(refreshTimeout);
        }
        
        // Continuously display the same judgement if there hasn't been a different one yet
        refreshTimeout = setTimeout(() => {
            refreshTimeout = null;
            refreshJudgementAnim();
        }, JUDGEMENT_VISUAL_FREQUENCY * 1000);
    }
    
    onMount(() => {
        refreshJudgementAnim();
    })
    
    // Enable this code to make the judgement pop up after every change
    $: {
        player_data.judgement,
        refreshJudgementAnim()
    }
    
</script>

<main>
    <div class='background'></div>
    <h1>{player_data.name}</h1>
    {#if currentJudgement}
        <h2
            bind:this={judgement_elem}
            class="judgement judgement_anim"
            style={`--judgement-color: ${
                JUDGEMENT_VISUALS[currentJudgement].color
            }; --judgement-frequency: ${JUDGEMENT_VISUAL_FREQUENCY}s`}
        >
            {JUDGEMENT_VISUALS[currentJudgement].name}
        </h2>
    {/if}
</main>

<style>
    main {
        position: relative;
        padding: 16px;
        user-select: none;
        width: 100%;
    }
    
    div.background {
        position: absolute;
        top: 0;
        left: 0;
        --edge-pixels: 50px;
        width: 100%;
        clip-path: polygon(
            0% 0%,
            100% 0%,
            calc(100% - var(--edge-pixels)) 100%,
            0% 100%
        );
        background-image: linear-gradient(
            45deg,
            var(--color-pink-dark) 0%,
            var(--color-pink-light) 100%
        );
        box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
        height: 100%;
    }

    h1 {
        position: relative;
        font-size: 2rem;
        font-weight: 700;
        text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
        color: var(--color-gray-100);
        margin-left: 10px;
    }
    
    h2.judgement {
        position: absolute;
        display: grid;
        place-items: center;
        left: 100%;
        top: 0;
        height: 100%;
        width: max-content;
        font-size: 3.5rem;
        font-weight: 900;
        color: white;
        text-transform: uppercase;
        margin-left: 10px;
        --fallback-color: 'red';
        text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5),
                     0px 0px 16px var(--judgement-color, var(--fallback-color)), 
                     0px 0px 8px var(--judgement-color, var(--fallback-color)), 
                     0px 0px 6px var(--judgement-color, var(--fallback-color));
    }
    
    h2.judgement_anim {
        /* animation: var(--judgement-frequency, 1s) ease-in judgement-anim; */
        animation: 0.1s ease-in judgement-anim;
    }
    
    @keyframes judgement-anim {
        0% {transform: scale(0.8); opacity: 0;}
        50% {transform: scale(1.1); opacity: 1;}
        100% {transform: scale(1); opacity: 1;}
    }
</style>

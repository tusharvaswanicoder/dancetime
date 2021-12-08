<script>
    import { scale } from "svelte/transition";
    import { onMount } from "svelte";
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import { ingameFinalScore } from '../stores';
    // import IngameEvaluationScreenParticles from './IngameEvaluationScreenParticles.svelte';
    
    let score_reveal_time = 4000;
    let counterAudio;
    let endFanfare;
    let audienceCheer;
    let wowAudio;
    let score = tweened(0, {
		duration: score_reveal_time
	});
    
    const delay = 1200;
    
    onMount(() => {
        setTimeout(() => {
            score.set($ingameFinalScore);
            counterAudio.volume = 0.5;
            counterAudio.play();
            
            setTimeout(() => {
                endFanfare.volume = 0.5;
                endFanfare.play();
                
                if ($ingameFinalScore >= 70) {
                    audienceCheer.volume = 0.25;
                    audienceCheer.play();
                }
                
                setTimeout(() => {
                    if ($ingameFinalScore >= 90) {
                        wowAudio.volume = 0.75;
                        wowAudio.play();
                    }
                }, 500);
                
            }, score_reveal_time);
        }, delay);
    })
</script>

<audio bind:this={counterAudio} src='../sfx/score_counter_2_long.ogg' />
<audio bind:this={endFanfare} src='../sfx/end_fanfare_short.ogg' />
<audio bind:this={audienceCheer} src='../sfx/audience_cheering.ogg' />
<audio bind:this={wowAudio} src='../sfx/crowd_wow.ogg' />

<main>
    <!-- <IngameEvaluationScreenParticles /> -->
    <div class="content">
        <h1 in:scale={{ delay: delay, easing: cubicOut, duration: score_reveal_time, start: 0, opacity: 1 }}>
            {($score).toFixed(2)}
        </h1>
    </div>
</main>

<style>
    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background-image: linear-gradient(52.52deg, #E63913 0.07%, #8640CC 23.06%, #5D5DE6 42.11%, #639DF3 69.91%, #F88AED 100.13%);
        z-index: 15;
        display: grid;
        place-items: center;
        cursor: default;
        user-select: none;
        color: var(--color-gray-100);
        clip-path: polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 25%, 0% 25%, 0% 25%, 0% 25%, 0% 25%, 0% 25%, 0% 25%);
        animation: 1s ease-in-out show-anim reverse forwards;
    }

    @keyframes show-anim {
        0% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 50%, 50% 50%, 25% 50%, 25% 75%, 75% 75%, 75% 25%, 0% 25%); }
        14.25% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%, 75% 25%, 75% 75%, 50% 75%, 50% 50%, 50% 50%, 25% 50%, 25% 75%, 75% 75%, 75% 25%, 0% 25%); }
        28.5% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%, 75% 25%, 75% 50%, 50% 50%, 50% 50%, 50% 50%, 25% 50%, 25% 75%, 75% 75%, 75% 25%, 0% 25%); }
        42.75% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%, 25% 25%, 25% 50%, 25% 50%, 25% 50%, 25% 50%, 25% 50%, 25% 75%, 75% 75%, 75% 25%, 0% 25%); }
        57% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 75%, 25% 75%, 25% 75%, 25% 75%, 25% 75%, 25% 75%, 25% 75%, 25% 75%, 75% 75%, 75% 25%, 0% 25%); }
        71.25% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 75% 100%, 75% 75%, 75% 75%, 75% 75%, 75% 75%, 75% 75%, 75% 75%, 75% 75%, 75% 75%, 75% 75%, 75% 25%, 0% 25%); }
        85.5% { clip-path: polygon(0% 0%, 100% 0%, 100% 25%, 75% 25%, 75% 25%, 75% 25%, 75% 25%, 75% 25%, 75% 25%, 75% 25%, 75% 25%, 75% 25%, 75% 25%, 75% 25%, 0% 25%); }
        100% {clip-path: polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 25%, 0% 25%, 0% 25%, 0% 25%, 0% 25%, 0% 25%, 0% 25%); }
    }
    
    div.content {
        display: grid;
        place-items: center;
        gap: 30px;
        width: fit-content;
        max-width: 50%;
        height: fit-content;
    }

    div.content > h1 {
        font-weight: 900;
        text-transform: uppercase;
        font-size: 12rem;
    }

</style>

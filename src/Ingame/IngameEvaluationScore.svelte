<script>
    import { scale, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut, circOut, elasticOut} from 'svelte/easing';
    export let finalScore = 0;
    export let num_players = 0;
    export let portrait_image;

    let score_reveal_time = 4000;
    let counterAudio;
    let endFanfare;
    let audienceCheer;
    let wowAudio;
    let score = tweened(0, {
        duration: score_reveal_time,
    });

    const delay = 1200;

    onMount(() => {
        setTimeout(() => {
            score.set(finalScore);
            counterAudio.volume = 0.5;
            counterAudio.play();

            setTimeout(() => {
                endFanfare.volume = 0.5;
                endFanfare.play();

                if (finalScore >= 70) {
                    audienceCheer.volume = 0.25;
                    audienceCheer.play();
                }

                setTimeout(() => {
                    if (finalScore >= 90) {
                        wowAudio.volume = 0.75;
                        wowAudio.play();
                    }
                }, 500);
            }, score_reveal_time);
        }, delay);
    });
    
    function animateHeight(node, params) {
		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || elasticOut,
			css: (t, u) => `max-height: ${t * 100}%`
		};
	}
</script>

<audio bind:this={counterAudio} src="../sfx/score_counter_2_long.ogg" />
<audio bind:this={endFanfare} src="../sfx/end_fanfare_short.ogg" />
<audio bind:this={audienceCheer} src="../sfx/audience_cheering.ogg" />
<audio bind:this={wowAudio} src="../sfx/crowd_wow.ogg" />

<div class="score-container">
    {#if num_players > 1}
        <div class='image-visibility-container' 
        in:animateHeight={{
            delay: score_reveal_time + delay + 500,
            duration: 2000,
            easing: cubicOut,
        }}
            style={`--profile-animation-delay: ${score_reveal_time + delay + 500}ms`}>
            <div
                class="image-container"
                in:fly={{
                    delay: score_reveal_time + delay + 1000,
                    y: 40,
                    duration: 1000,
                    easing: circOut,
                }}
            >
                <!-- svelte-ignore a11y-missing-attribute -->
                <img src={portrait_image} />
            </div>
        </div>
    {/if}

    <h1
        in:scale={{
            delay: delay,
            easing: cubicOut,
            duration: score_reveal_time,
            start: 0,
            opacity: 1,
        }}
    >
        {$score.toFixed(2)}
    </h1>
</div>

<style>
    div.score-container {
        display: flex;
        flex-direction: column;
        height: 500px;
        position: relative;
        place-content: center;
    }

    h1 {
        font-weight: 900;
        text-transform: uppercase;
        font-size: 10rem;
        text-align: center;
    }

    div.image-visibility-container {
        overflow: visible;
        display: flex;
        justify-content: center;
    }
    
    div.image-container {
        border-radius: 500px;
        aspect-ratio: 1 / 1;
        overflow: hidden;
        width: 50%;
        border: 8px solid white;
        margin-bottom: 20px;
    }
    
    img {
        height: 100%;
        width: 100%;
        object-fit: cover;
    }
</style>

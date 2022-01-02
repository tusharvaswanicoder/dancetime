<script>
    import { scale } from "svelte/transition";
    import { onMount } from "svelte";
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    export let finalScore = 0;
    
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
    })
</script>

<audio bind:this={counterAudio} src='../sfx/score_counter_2_long.ogg' />
<audio bind:this={endFanfare} src='../sfx/end_fanfare_short.ogg' />
<audio bind:this={audienceCheer} src='../sfx/audience_cheering.ogg' />
<audio bind:this={wowAudio} src='../sfx/crowd_wow.ogg' />

<h1 in:scale={{ delay: delay, easing: cubicOut, duration: score_reveal_time, start: 0, opacity: 1 }}>
    {($score).toFixed(2)}
</h1>

<style>
    h1 {
        font-weight: 900;
        text-transform: uppercase;
        font-size: 12rem;
    }

</style>

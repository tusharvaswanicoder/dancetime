<script>
    import { onMount } from 'svelte';
    import { JUDGEMENT_FREQUENCY, JUDGEMENT_VISUALS } from './Scoring/Judgements';
    import { ingameVideoPlayer, ingameShouldScore, ingameNumStars } from '../stores';
    import Icon from '../Icon.svelte';
    export let player_data = { name: 'Unknown' };
    
    let judgement_elem;
    let refreshTimeout;
    let currentJudgement;
    
    const star_stops = [
        { color: 'var(--color-yellow-dark)', offset: '0' },
        { color: 'var(--color-yellow-light)', offset: '1' },
    ];
    
    const refreshJudgementAnim = async () => {
        // if (($ingameVideoPlayer && $ingameVideo.ended) || refreshTimeout) {
        // TODO: update this
        if ($ingameVideoPlayer || refreshTimeout) {
            return;
        }
        
        if (refreshTimeout) {
            clearTimeout(refreshTimeout);
        }
        
        // Continuously display the same judgement if there hasn't been a different one yet
        refreshTimeout = setTimeout(() => {
            refreshTimeout = null;
            refreshJudgementAnim();
        }, JUDGEMENT_FREQUENCY * 1000);
        
        if ($ingameShouldScore) {
            currentJudgement = player_data.judgement;
            if (judgement_elem && currentJudgement) {
                judgement_elem.classList.remove('judgement_anim');
                // Magic line to refresh https://css-tricks.com/restart-css-animation/
                void judgement_elem.offsetWidth;
                judgement_elem.classList.add('judgement_anim');
            }
        }
    }
    
    onMount(() => {
        refreshJudgementAnim();
    })
    
    // Enable this code to make the judgement pop up after every change
    // $: {
    //     player_data.judgement,
    //     refreshJudgementAnim()
    // }
    
    // 0.6 seconds for intro
    // 0.6-1 for zoom into place
    // 1-x for in place
    const starAudio = {}
    let num_stars = 0;
    $: {
        if ($ingameNumStars > num_stars) {
            num_stars = $ingameNumStars;
            
            if (starAudio[$ingameNumStars]) {
                starAudio[$ingameNumStars].play();
            }
        }
    }
    
    $: starsArray = Array.from({length: num_stars}, () => 1)
    
</script>


<audio bind:this={starAudio[1]} src='../sfx/got_star_1.ogg' />
<audio bind:this={starAudio[2]} src='../sfx/got_star_2.ogg' />
<audio bind:this={starAudio[3]} src='../sfx/got_star_3.ogg' />
<audio bind:this={starAudio[4]} src='../sfx/got_star_4.ogg' />


<main>
    <div class='background'></div>
    <div class='content'>
        <h1>{player_data.name}</h1>
        <div class='star-container unfilled'>
            {#each {length: 4} as _}
                <Icon name={'star'} />
            {/each}
            
            <div class='star-container filled'>
                {#each starsArray as _}
                    <div>
                        <Icon name={'star'} stops={star_stops} />
                    </div>
                {/each}
            </div>
        </div>
    </div>
    
    {#if currentJudgement}
        <h2
            bind:this={judgement_elem}
            class="judgement judgement_anim"
            style={`--judgement-color: ${
                JUDGEMENT_VISUALS[currentJudgement].color
            }; --judgement-frequency: ${JUDGEMENT_FREQUENCY}s`}
        >
            {JUDGEMENT_VISUALS[currentJudgement].name}
        </h2>
    {/if}
</main>

<style>
    main {
        position: relative;
        user-select: none;
        width: 100%;
        --edge-pixels: 50px;
    }
    
    div.background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        clip-path: polygon(
            0% 0%,
            100% 0%,
            calc(100% - var(--edge-pixels)) 100%,
            0% 100%
        );
        background-image: linear-gradient(
            45deg,
            var(--color-blue-dark) 0%,
            var(--color-blue-light) 100%
        );
        box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
        height: 100%;
    }
    
    div.content {
        position: relative;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: 1fr max-content;
    }

    h1 {
        position: relative;
        font-size: 2rem;
        font-weight: 700;
        text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
        color: var(--color-gray-100);
        margin-left: 10px;
        padding: 16px;
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
        text-shadow: 0px 1px 2px rgba(0, 0, 0, 1),
                     0px 2px 4px rgba(0, 0, 0, 0.75),
                     0px 0px 16px var(--judgement-color, var(--fallback-color)), 
                     0px 0px 8px var(--judgement-color, var(--fallback-color)), 
                     0px 0px 6px var(--judgement-color, var(--fallback-color));
    }
    
    h2.judgement_anim {
        animation: var(--judgement-frequency, 1s) ease-in judgement-anim forwards;
        /* animation: 0.4s ease-in judgement-anim; */
    }
    
    @keyframes judgement-anim {
        0% {transform: scale(0.8); opacity: 0;}
        10% {transform: scale(1.1); opacity: 1;}
        20%, 30% {transform: scale(1); opacity: 1;}
        100% {transform: scale(0.9); opacity: 0;}
    }
    
    div.star-container {
        position: relative;
        margin-right: var(--edge-pixels);
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 2px;
        padding: 4px;
        font-size: 1.5rem;
    }
    
    div.star-container.unfilled {
        color: var(--color-gray-500);
    }
    
    div.star-container.filled {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        --icon-filter: 
            drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.5)) 
            drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5)) 
            drop-shadow(0px 0px 2px var(--color-yellow-light)) 
            drop-shadow(0px 0px 4px var(--color-yellow-light))
            drop-shadow(0px 0px 8px var(--color-yellow-dark));
    }
    
    div.star-container.filled > div {
        animation: 1.2s ease-in-out star-appear;
    }
    
    @keyframes star-appear {
        0% {opacity: 0; transform: scale(1) rotate(-180deg);}
        15% {opacity: 1; transform: scale(3) rotate(0deg);}
        95% {opacity: 1; transform: scale(3.5) rotate(90deg);}
        100% {opacity: 1; transform: scale(1) rotate(0deg);}
    }
</style>
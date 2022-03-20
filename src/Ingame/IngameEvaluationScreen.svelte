<script>
    import { ingameFinalScores, ingamePlayerPortraits, keyPress } from '../stores';
    import IngameEvaluationScore from './IngameEvaluationScore.svelte';
    import { fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { ExitGame } from '../utils';
    // import IngameEvaluationScreenParticles from './IngameEvaluationScreenParticles.svelte';

    let player_ids = [];
    $: player_ids = Object.keys($ingameFinalScores);
    
    const onKeyPress = (e) => {
        if (e.key == "Enter") {
            ExitGame();
        }
    }
    
    $: {
        onKeyPress($keyPress);
    }

</script>

<main>
    <!-- <IngameEvaluationScreenParticles /> -->
    <div class="content" style={`--num-players: ${player_ids.length};`}>
        {#each player_ids as player_id}
            <IngameEvaluationScore
                finalScore={$ingameFinalScores[player_id]}
                portrait_image={$ingamePlayerPortraits[player_id]}
                num_players={player_ids.length}
            />
        {/each}
    </div>
    <div class='continue' in:fly={{delay: 12000, duration: 1000, y: 20, easing: cubicOut}} >Press Enter to continue.</div>
</main>

<style>
    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background-image: linear-gradient(
            52.52deg,
            #e63913 0.07%,
            #8640cc 23.06%,
            #5d5de6 42.11%,
            #639df3 69.91%,
            #f88aed 100.13%
        );
        z-index: 15;
        display: grid;
        place-items: center;
        cursor: default;
        user-select: none;
        color: var(--color-gray-100);
        clip-path: polygon(
            0% 0%,
            0% 0%,
            0% 0%,
            0% 0%,
            0% 0%,
            0% 0%,
            0% 0%,
            0% 0%,
            0% 25%,
            0% 25%,
            0% 25%,
            0% 25%,
            0% 25%,
            0% 25%,
            0% 25%
        );
        animation: 1s ease-in-out show-anim reverse forwards;
    }

    @keyframes show-anim {
        0% {
            clip-path: polygon(
                0% 0%,
                100% 0%,
                100% 100%,
                0% 100%,
                0% 25%,
                75% 25%,
                75% 75%,
                25% 75%,
                25% 50%,
                50% 50%,
                25% 50%,
                25% 75%,
                75% 75%,
                75% 25%,
                0% 25%
            );
        }
        14.25% {
            clip-path: polygon(
                0% 0%,
                100% 0%,
                100% 100%,
                0% 100%,
                0% 25%,
                75% 25%,
                75% 75%,
                50% 75%,
                50% 50%,
                50% 50%,
                25% 50%,
                25% 75%,
                75% 75%,
                75% 25%,
                0% 25%
            );
        }
        28.5% {
            clip-path: polygon(
                0% 0%,
                100% 0%,
                100% 100%,
                0% 100%,
                0% 25%,
                75% 25%,
                75% 50%,
                50% 50%,
                50% 50%,
                50% 50%,
                25% 50%,
                25% 75%,
                75% 75%,
                75% 25%,
                0% 25%
            );
        }
        42.75% {
            clip-path: polygon(
                0% 0%,
                100% 0%,
                100% 100%,
                0% 100%,
                0% 25%,
                25% 25%,
                25% 50%,
                25% 50%,
                25% 50%,
                25% 50%,
                25% 50%,
                25% 75%,
                75% 75%,
                75% 25%,
                0% 25%
            );
        }
        57% {
            clip-path: polygon(
                0% 0%,
                100% 0%,
                100% 100%,
                0% 100%,
                0% 75%,
                25% 75%,
                25% 75%,
                25% 75%,
                25% 75%,
                25% 75%,
                25% 75%,
                25% 75%,
                75% 75%,
                75% 25%,
                0% 25%
            );
        }
        71.25% {
            clip-path: polygon(
                0% 0%,
                100% 0%,
                100% 100%,
                75% 100%,
                75% 75%,
                75% 75%,
                75% 75%,
                75% 75%,
                75% 75%,
                75% 75%,
                75% 75%,
                75% 75%,
                75% 75%,
                75% 25%,
                0% 25%
            );
        }
        85.5% {
            clip-path: polygon(
                0% 0%,
                100% 0%,
                100% 25%,
                75% 25%,
                75% 25%,
                75% 25%,
                75% 25%,
                75% 25%,
                75% 25%,
                75% 25%,
                75% 25%,
                75% 25%,
                75% 25%,
                75% 25%,
                0% 25%
            );
        }
        100% {
            clip-path: polygon(
                0% 0%,
                0% 0%,
                0% 0%,
                0% 0%,
                0% 0%,
                0% 0%,
                0% 0%,
                0% 0%,
                0% 25%,
                0% 25%,
                0% 25%,
                0% 25%,
                0% 25%,
                0% 25%,
                0% 25%
            );
        }
    }

    div.content {
        display: grid;
        place-items: center;
        width: fit-content;
        max-width: 90%;
        height: fit-content;
        grid-template-columns: repeat(var(--num-players), min-content);
        gap: 15vw;
    }
    
    div.continue {
        position: absolute;
        bottom: 50px;
        RIGHT: 50px;
        font-size: 20px;
        font-style: italic;
    }
</style>

<script>
    import IngamePlayerScore from "./IngamePlayerScore.svelte";
    import { ingameCurrentJudgement, groupmodeStateStore, ingameNumStars } from '../stores';
    import { USER } from '../Auth';
    import { GROUP_STATE } from '../constants';
</script>

<main>
    {#if $groupmodeStateStore == GROUP_STATE.SOLO}
        <IngamePlayerScore player_data={{
            name: $USER.username,
            judgement: $ingameCurrentJudgement[0],
            num_stars: $ingameNumStars[0]
        }} />
    {:else}
        {#each Object.keys($ingameCurrentJudgement).slice(0, 6) as player_id}
            <IngamePlayerScore player_data={{
                name: `Player ${player_id}`,
                judgement: $ingameCurrentJudgement[player_id],
                num_stars: $ingameNumStars[player_id]
            }} />
        {/each}
    {/if}
</main>

<style>
    main {
        position: relative;
    }
</style>
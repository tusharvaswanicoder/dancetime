<script>
    import IngamePlayerScore from "./IngamePlayerScore.svelte";
    import { ingameCurrentJudgement } from '../stores';
</script>

<main>
    <IngamePlayerScore player_data={{
        name: 'benank',
        judgement: $ingameCurrentJudgement
    }} />
    <!-- TODO: limit number of player scores displayed so they don't over flow -->
</main>

<style>
    main {
        position: relative;
    }
</style>
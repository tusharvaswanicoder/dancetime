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
        position: absolute;
        min-width: fit-content;
        width: max(30%, 350px);
        max-width: 450px;
        height: fit-content;
        top: 15%;
        left: 0;
        display: flex;
        flex-direction: column;
        gap: 40px;
        max-height: 45%;
    }
</style>
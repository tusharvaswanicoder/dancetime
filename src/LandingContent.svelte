<script>
    import MainContent from "./MainContent.svelte"
    import SettingsScreen from "./SettingsScreen.svelte";
    import IngameContent from "./Ingame/IngameContent.svelte";
    import CreateUsernamePage from "./CreateUsernamePage.svelte";
    import { GAMESTATE } from "./constants";
    import { settingsOpen, gameState } from "./stores";
    import { USER } from './Auth';
    
    // Score screen testing
    // import IngameEvaluationScreen from "./Ingame/IngameEvaluationScreen.svelte";
    // import { ingameFinalScores } from './stores';
    // import { onMount } from "svelte";
    
    // onMount(() => {
    //     $ingameFinalScores[0] = 95;
    //     $ingameFinalScores[1] = 87;
    // })

</script>

<main>
    {#if !$USER.username}
        <CreateUsernamePage />
    {:else}
        {#if $gameState == GAMESTATE.NOT_INGAME}
            <MainContent />
        {:else if $gameState == GAMESTATE.INGAME}
            <IngameContent />
        {/if}
        {#if $settingsOpen}
            <SettingsScreen />
        {/if}
    {/if}
    <!-- <IngameEvaluationScreen /> -->
</main>

<style>
    main {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }
</style>
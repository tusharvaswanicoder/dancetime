<script>
    import Sidebar from "./Sidebar.svelte"
    import MainContent from "./MainContent.svelte"
    import SettingsScreen from "./SettingsScreen.svelte";
    import IngameContent from "./Ingame/IngameContent.svelte";
    import { GAMESTATE } from "./constants";
    import { settingsOpen, gameState } from "./stores";
    import PlayModes from "./MainNavigation/PlayModes.svelte";
    
    // Score screen testing
    // import IngameEvaluationScreen from "./Ingame/IngameEvaluationScreen.svelte";
    // import { ingameFinalScore } from './stores';
    // import { onMount } from "svelte";
    
    // onMount(() => {
    //     $ingameFinalScore = 95;
    // })

</script>

<main>
    {#if $gameState == GAMESTATE.NOT_INGAME}
        <MainContent />
    {:else if $gameState == GAMESTATE.INGAME}
        <IngameContent />
    {/if}
    {#if $settingsOpen}
        <SettingsScreen />
    {/if}
    <PlayModes />
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
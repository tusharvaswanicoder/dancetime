<script>
    import Sidebar from "./Sidebar.svelte"
    import MainContent from "./MainContent.svelte"
    import SettingsScreen from "./SettingsScreen.svelte";
    import IngameContent from "./Ingame/IngameContent.svelte";
    import { GAMESTATE } from "./constants";
    import { settingsOpen, gameState } from "./stores";

</script>

<main>
    {#if $gameState == GAMESTATE.NOT_INGAME}
        <section class='grid'>
            <Sidebar />
            <MainContent />
        </section>
    {:else if $gameState == GAMESTATE.INGAME}
        <IngameContent />
    {/if}
    {#if $settingsOpen}
        <SettingsScreen />
    {/if}
</main>

<style>
    main {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    section.grid {
        position: relative;
        display: grid;
        height: 100%;
        width: 100%;
        grid-template-columns: 250px 1fr;
        grid-template-areas: 
            'sidebar main';
        overflow: hidden;
    }
</style>
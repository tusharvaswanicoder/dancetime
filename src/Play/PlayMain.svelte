<script>
    import { SIDEBAR_SECTIONS_DETAILS, SIDEBAR_SECTIONS } from '../constants';
    import { sidebarStateStore } from '../stores';
    import HomePage from './Home/HomePage.svelte';
    
    const SIDEBAR_TO_COMPONENT_MAP = 
    {
        [SIDEBAR_SECTIONS.HOME]: HomePage,
        // [SIDEBAR_SECTIONS.EXPLORE]: HomePage,
        // [SIDEBAR_SECTIONS.FEED]: HomePage,
        // [SIDEBAR_SECTIONS.RIVALS]: HomePage,
        // [SIDEBAR_SECTIONS.FAVORITES]: HomePage,
        // [SIDEBAR_SECTIONS.HISTORY]: HomePage,
        // [SIDEBAR_SECTIONS.HELP]: HomePage,
        // [SIDEBAR_SECTIONS.FEEDBACK]: HomePage,
        // [SIDEBAR_SECTIONS.SETTINGS]: HomePage,
    }
    
</script>

<main>
    {#if SIDEBAR_TO_COMPONENT_MAP[$sidebarStateStore]}
        <svelte:component this={SIDEBAR_TO_COMPONENT_MAP[$sidebarStateStore]} />
    {:else}
        <div class='wip'>
            Hi, the <b>{SIDEBAR_SECTIONS_DETAILS[$sidebarStateStore].name}</b> page is still in progress!
            <br /><br />
            Please check back later! 😀
        </div>
    {/if}
</main>

<style>
    main {
        position: relative;
        grid-area: main;
        background-color: #F9F9F9;
        overflow-y: auto;
    }
    
    div.wip {
        margin: 20px;
        font-size: 18px;
    }
</style>
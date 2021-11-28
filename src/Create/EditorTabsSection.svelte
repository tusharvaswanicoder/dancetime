<script>
    import EditTab from './EditTab.svelte';
    import ReviewTab from './ReviewTab.svelte';
    import PublishTab from './PublishTab.svelte';
    import { EDITOR_TAB_STATE } from '../constants';
    import { createAAInProgress, createTabState } from '../stores';
    
    let tab_state = EDITOR_TAB_STATE.REVIEW;
    
    const tabs = {
        [EDITOR_TAB_STATE.EDIT]: EditTab,
        [EDITOR_TAB_STATE.REVIEW]: ReviewTab,
        [EDITOR_TAB_STATE.PUBLISH]: PublishTab
    }
    
    const clickTab = (tab_name) => {
        if ($createAAInProgress) {
            return;
        }
        
        tab_state = EDITOR_TAB_STATE[tab_name];
    }
    
    $: {
        $createTabState = tab_state;
    }
    
</script>

<main>
    <section class='tab-controls'>
        {#each Object.entries(EDITOR_TAB_STATE) as [tab_name, tab_value]}
            <div class='tab' class:disabled={$createAAInProgress} on:click={() => clickTab(tab_name)} class:selected={tab_state == tab_value}>{tab_name}</div>
        {/each}
    </section>
    <section class='tab-content' >
        <svelte:component this={tabs[tab_state]} {tab_state}/>
    </section>
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: min-content 1fr;
        color: white;
    }
    
    section.tab-controls {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: space-evenly;
        width: 100%;
        font-size: 18px;
        color: var(--color-gray-500);
        user-select: none;
    }
    
    section.tab-controls div.tab {
        text-align: center;
        padding: 5px;
        width: 100%;
        height: 100%;
        cursor: pointer;
        transition: 0.2s ease-in-out all;
        background-color: var(--color-gray-800);
        border-right: 2px solid var(--color-gray-700);
    }
    
    section.tab-controls div.tab:last-child {
        border-right: none;
    }
    
    section.tab-controls div.tab.selected {
        font-weight: 700;
        color: var(--color-yellow-light);
        background-color: transparent;
        cursor: default;
    }
    
    section.tab-controls div.tab.disabled:not(.selected) {
        cursor: not-allowed;
    }
    
    section.tab-content {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>
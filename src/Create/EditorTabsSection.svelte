<script>
    export let project = {};
    import EditTab from './EditTab.svelte';
    import ReviewTab from './ReviewTab.svelte';
    import PublishTab from './PublishTab.svelte';
    
    const TAB_STATE = {
        EDIT: 1,
        REVIEW: 2,
        PUBLISH: 3
    }
    let tab_state = TAB_STATE.EDIT;
    
    const tabs = {
        [TAB_STATE.EDIT]: EditTab,
        [TAB_STATE.REVIEW]: ReviewTab,
        [TAB_STATE.PUBLISH]: PublishTab
    }
    
    const clickTab = (tab_name) => {
        tab_state = TAB_STATE[tab_name];
    }
    
</script>

<main>
    <section class='tab-controls'>
        {#each Object.entries(TAB_STATE) as [tab_name, tab_value]}
            <div class='tab' on:click={() => clickTab(tab_name)} class:selected={tab_state == tab_value}>{tab_name}</div>
        {/each}
    </section>
    <section class='tab-content'>
        <svelte:component {project} this={tabs[tab_state]}/>
    </section>
</main>

<style>
    main {
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
    }
</style>
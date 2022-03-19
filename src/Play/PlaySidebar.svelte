<script>
    import { SIDEBAR_SECTIONS_DETAILS, SIDEBAR_SECTIONS } from '../constants';
    import Icon from '../Icon.svelte';
    import { sidebarStateStore } from '../stores';
    
    const ClickSidebarEntry = (index) => {
        $sidebarStateStore = index;
    }
    
</script>

<main>
    {#each Object.entries(SIDEBAR_SECTIONS_DETAILS) as [index, details]}
        <div class='sidebar-entry' on:click={() => ClickSidebarEntry(index)} class:selected={$sidebarStateStore == index}>
            <span class='icon'>
                <Icon name={`${details.icon}${$sidebarStateStore == index ? '_filled' : ''}`} />
            </span>
            <span class='title'>{details.name}</span>
        </div>
        {#if index == SIDEBAR_SECTIONS.HISTORY}
            <div class='hr' />
        {/if}
    {/each}
</main>

<style>
    main {
        grid-area: sidebar;
        background-color: white;
        overflow-y: auto;
    }
    
    div.sidebar-entry {
        width: 100%;
        padding-top: 12px;
        padding-bottom: 12px;
        padding-left: 20px;
        display: flex;
        align-items: center;
        user-select: none;
        cursor: pointer;
    }
    
    div.sidebar-entry.selected {
        background-color: #D6D6D6;
    }
    
    div.sidebar-entry span.icon {
        font-size: 26px;
    }
    
    div.sidebar-entry span.title {
        margin-left: 30px;
        font-size: 18px;
    }
    
    div.hr {
        margin-top: 12px;
        margin-bottom: 12px;
        margin-left: 5%;
        width: 90%;
        background-color: #CACACA;
        height: 1px;
    }
</style>
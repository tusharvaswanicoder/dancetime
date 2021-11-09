<script>
    import Icon from '../Icon.svelte';
    import { fly } from 'svelte/transition'
    import VideoPreview from './VideoPreview.svelte';
    
    
    export let ExitEditor = () => {};
    export let selectedProject;
</script>

<main in:fly|local={{x: 500, duration: 200, delay: 200}} out:fly|local={{x: 500, duration: 200}}>
    <main class='grid-container'>
        <section class='tabs'></section>
        <section class='save'>
            Save
            <div class="icon-container">
                <Icon name="save_icon" stops={[
                    { color: 'var(--color-yellow-dark)', offset: '0' },
                    { color: 'var(--color-yellow-light)', offset: '1' },
                ]} />
            </div>
        </section>
        <section class='timeline'></section>
        <section class='preview'>
            <div class='title'>{selectedProject.project_name}</div>
            <VideoPreview project={selectedProject} />
        </section>
    </main>
    
    <div class="close-container" on:click={ExitEditor}>
        <Icon name="x_icon" />
    </div>
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        position: relative;
    }
    
    main.grid-container {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(14, 1fr);
        background-color: var(--color-gray-500);
        gap: 1px;
        --tabs-row-amount: 10; /* Amount of rows that the tabs section should have */
    }
    
    main.grid-container > section {
        background-color: var(--color-gray-900);
    }
    
    section.tabs {
        grid-column: 1 / 2;
        grid-row: 1 / var(--tabs-row-amount);
    }
    
    section.save {
        grid-column: 1 / 2;
        grid-row: var(--tabs-row-amount) / calc(var(--tabs-row-amount) + 1);
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--color-yellow-light);
        font-weight: 700;
        text-transform: uppercase;
        font-size: 20px;
        cursor: pointer;
        transition: 0.2s ease-in-out background-color;
        user-select: none;
    }
    
    section.save:hover {
        background-color: var(--color-gray-850);
    }
    
    section.save:active {
        background-color: var(--color-gray-800);
    }
    
    section.save div.icon-container {
        margin-left: 10px;
        margin-bottom: -2px; /* It somehow has 2px extra at the bottom... */
    }
    
    section.timeline {
        grid-column: 1 / -1;
        grid-row: calc(var(--tabs-row-amount) + 1) / -1;
    }
    
    section.preview {
        grid-column: 2 / -1;
        grid-row: 1 / calc(var(--tabs-row-amount) + 1);
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: min-content 1fr;
        padding: 10px;
        padding-left: 40px;
        padding-right: 40px;
    }
    
    section.preview div.title {
        color: var(--color-gray-300);
        font-size: 22px;
        cursor: default;
    }
    
    div.close-container {
        position: absolute;
        top: 0;
        right: 0;
        color: var(--color-gray-300);
        margin: 10px;
        font-size: 1.25rem;
        cursor: pointer;
    }
    
    div.close-container:hover {
        color: white;
    }
    
</style>
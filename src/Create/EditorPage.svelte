<script>
    import Icon from '../Icon.svelte';
    import { fly, fade } from 'svelte/transition';
    import VideoPreviewAndNav from './VideoPreviewAndNav.svelte';
    import VideoTimeline from "./VideoTimeline.svelte";
    import ProgressCircle from '../ProgressCircle.svelte';
    import { createLoadingPercent } from "../stores";
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    
    const loadingScreenEnabled = true;
    
    const stops = [
        { color: 'var(--color-yellow-dark)', offset: '0' },
        { color: 'var(--color-yellow-light)', offset: '1' },
    ];
    
    let load_progress = tweened(0, {
        duration: 200,
		easing: cubicOut
	});
    
    $: {
        load_progress.set($createLoadingPercent * 100)
    }
    
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
        <section class='timeline'>
            <VideoTimeline project={selectedProject} />
        </section>
        <section class='preview'>
            <VideoPreviewAndNav project={selectedProject} />
        </section>
    </main>
    
    {#if $load_progress < 100 && loadingScreenEnabled}
        <div class='loadscreen' out:fade|local={{delay: 1000}}>
            <span>Loading your project...</span>
            <div class="circle-container">
                <ProgressCircle {stops} value={$load_progress}>
                    <span>{Math.ceil($load_progress)}%</span> 
                </ProgressCircle>
            </div>
        </div>
    {/if}
    
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
    
    div.loadscreen {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: var(--color-gray-900);
        z-index: 9;
        display: flex;
        gap: 20px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    div.loadscreen > span {
        color: var(--color-gray-300);
        cursor: default;
    }
    
    main.grid-container {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(14, 1fr);
        background-color: var(--color-gray-500);
        gap: 1px;
        --tabs-row-amount: 11; /* Amount of rows that the tabs section should have */
    }
    
    main.grid-container > section {
        background-color: var(--color-gray-900);
        overflow: hidden;
    }
    
    section.tabs {
        grid-column: 1 / 2;
        grid-row: 1 / var(--tabs-row-amount);
        overflow-y: auto;
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
    }
    
    div.close-container {
        position: absolute;
        top: 0;
        right: 0;
        color: var(--color-gray-300);
        margin: 10px;
        font-size: 1.25rem;
        cursor: pointer;
        z-index: 10;
    }
    
    div.close-container:hover {
        color: white;
    }
    
    div.circle-container {
        width: 120px;
        height: 120px;
        --progress-trackcolor: var(--color-gray-700);
        --progress-color: var(--color-blue-dark);
    }

    div.circle-container span {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: fit-content;
        height: fit-content;
        margin: auto;
        font-weight: 700;
        font-size: 20px;
        cursor: default;
        color: var(--color-yellow-light);
    }

</style>
<script>
    import Icon from '../Icon.svelte';
    import { fly } from 'svelte/transition';
    import VideoPreviewAndNav from './VideoPreviewAndNav.svelte';
    import VideoTimeline from './VideoTimeline.svelte';
    import EditorTabsSection from './EditorTabsSection.svelte';
    import {
        createProjectUnsaved,
        createProject,
    } from '../stores';
    import projectManager from './ProjectManager';
    import { onMount } from 'svelte';
    import { DB_TABLES, GetObjectFromDB } from '../ChartAndKeypointDBManager';

    const saveProject = () => {
        if (!$createProjectUnsaved) {
            return;
        }

        projectManager.saveProject($createProject);
        $createProjectUnsaved = false;
    };

    onMount(() => {
        // Load keypoints from IndexedDB
        if ($createProject) {
            GetObjectFromDB(
                $createProject.uuid,
                DB_TABLES.LOCAL_KEYPOINTS,
                (object) => {
                    if (object) {
                        $createProject.keypoints = JSON.parse(object);
                        $createProject = $createProject;
                    }
                }
            );
        }
    });

    export let ExitEditor = () => {};
</script>

<main
    out:fly|local={{ x: 500, duration: 200 }}
>
    <main class="grid-container">
        <section class="tabs">
            <EditorTabsSection />
        </section>
        <section
            class="save"
            class:saved={!$createProjectUnsaved}
            on:click={saveProject}
        >
            {#if $createProjectUnsaved}
                Save
                <div class="icon-container">
                    <Icon
                        name="save_icon"
                        stops={[
                            { color: 'var(--color-yellow-dark)', offset: '0' },
                            { color: 'var(--color-yellow-light)', offset: '1' },
                        ]}
                    />
                </div>
            {:else}
                All Changes Saved
            {/if}
        </section>
        <section class="timeline">
            <!-- <VideoTimeline /> -->
        </section>
        <section class="preview">
            <VideoPreviewAndNav />
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
        --tabs-row-amount: 11; /* Amount of rows that the tabs section should have */
    }

    main.grid-container > section {
        position: relative;
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

    section.save:not(.saved):hover {
        background-color: var(--color-gray-850);
    }

    section.save:not(.saved):active {
        background-color: var(--color-gray-800);
    }

    section.save.saved {
        color: var(--color-gray-500);
        cursor: default;
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
</style>

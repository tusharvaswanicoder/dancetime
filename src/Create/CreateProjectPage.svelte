<script>
    import { v1 } from 'uuid';
    import ProjectCard from './ProjectCard.svelte';
    import { VISIBILITY } from "../constants"
    import Icon from '../Icon.svelte';
    import projectManager from "./ProjectManager"
    import { fade, fly } from 'svelte/transition'
    import { cubicOut } from 'svelte/easing';
    import { onMount } from 'svelte';
    
    export let OpenProject = () => {};
    
    const STATE = {
        PROJECTS_LIST: 1,
        CREATE_NEW: 2
    }
    
    let current_state = STATE.PROJECTS_LIST;
    
    const ExitCreateNew = () => {
        current_state = STATE.PROJECTS_LIST;
        create_new_link = '';
        create_new_title = '';
    }
    
    const OnCardClick = (card_data) => {
        if (card_data.new_project)
        {
            // Start creating a new project
            current_state = STATE.CREATE_NEW;
        }
        else
        {
            // Open existing project
        }
    }
    
    let create_new_title = '';
    let create_new_link = '';
    let create_new_valid = false;
    
    const ValidateCreateNewParams = () => {
        if (create_new_link.length < 10 || create_new_title.length < 1)
        {
            // Invalid inputs, return
            return false;
        }
        
        if (create_new_title.length > 60) {
            // Title too long
            return false;
        }
        
        return true;
    }
    
    $: {
        create_new_link,
        create_new_title,
        create_new_valid = ValidateCreateNewParams()
    }
    
    // User clicks the CREATE button after clicking "Create New Project"
    const CreateNewProject = () => {
        if (!create_new_valid) {
            return;
        }
        
        // OK inputs, sanity check for duplicate project names? Or just use IDs so project names don't matter
        projectManager.createNewProject(create_new_title, create_new_link);
        
        // Create project
        current_state = STATE.PROJECTS_LIST;
    }
    
    $: {
        $projectManager
        // TestOpenFirstProject()
    }
    
    const TestOpenFirstProject = () => {
        if (Object.keys(projectManager.projects).length > 0) {
            setTimeout(() => {
                OnClickProjectOpen(Object.values(projectManager.projects)[0]);
            }, 1000);
        }
    }
    
    const OnClickProjectOpen = (project) => {
        OpenProject(project);
    };
    
    const OnClickProjectDelete = (project) => {
        projectManager.deleteProject(project);
    };
    
    let projectNameElement;
    $: {
        projectNameElement?.focus();
    }
</script>

{#if current_state == STATE.CREATE_NEW}
    <div class='create-new-container' transition:fade={{duration: 200}}>
        <div class='exit-click-container' on:click={() => {ExitCreateNew()}}></div>
        <main class='background' transition:fly|local="{{ y: 100, duration: 400, easing: cubicOut}}">
            <div class='content'>
                <h1>Create New Project</h1>
                <div class='details-container'>
                    <h2>Project Name</h2>
                    <input bind:this={projectNameElement} bind:value={create_new_title} placeholder="My First Project" />
                    <!-- <h2>Video Source</h2>
                    <h3>YouTube</h3> -->
                    <h2>Video Link</h2>
                    <input bind:value={create_new_link} placeholder="https://www.youtube.com/watch?v=pdsGv5B9OSQ" />
                    <h2 class={`create-button ${create_new_valid ? '' : 'invalid'}`} on:click={() => CreateNewProject()}>Create</h2>
                </div>
                <div class="icon-container" on:click={() => {ExitCreateNew()}}>
                    <Icon name="x_icon" />
                </div>
            </div>
        </main>
    </div>
{/if}

<main class:blurred={current_state == STATE.CREATE_NEW} 
in:fly|local={{x: -500, duration: 200, delay: 200}} 
out:fly|local={{x: -500, duration: 200}}>
    <section class="title-section">
        <h1>Create</h1>
        <h2>Create your own dance charts from YouTube videos.</h2>
    </section>
    <section class="projects-section">
        <h1>My Projects</h1>
        <div class="projects-container">
            <ProjectCard OnClick={OnCardClick} card_data={{
                title: "Create New Project",
                new_project: true
            }} />
            {#each Object.values($projectManager) as project}
                <ProjectCard 
                    card_data={project} 
                    OnClickOpen={() => OnClickProjectOpen(project)} 
                    OnClickDelete={() => OnClickProjectDelete(project)} 
                />
            {/each}
        </div>
    </section>
</main>

<style>
    main {
        position: relative;
        display: grid;
        grid-template-rows: min-content auto;
        height: 100%;
        --card-height: 22rem;
        transition: 0.2s linear filter;
    }
    
    main.blurred {
        filter: blur(8px);
    }

    section.title-section {
        padding-top: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 40px;
    }

    section.title-section h1 {
        font-size: 3rem;
        font-weight: 700;
        text-transform: uppercase;
        background: linear-gradient(
            45deg,
            var(--color-yellow-dark) 0%,
            var(--color-yellow-light) 100%
        );
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline;
    }

    section.title-section h2 {
        margin-top: 20px;
        color: white;
    }

    section.projects-section {
        display: flex;
        flex-direction: column;
        min-height: 0;
        max-height: 100%;
        margin-left: 40px;
        margin-right: 40px;
    }

    section.projects-section h1 {
        font-size: 1.25rem;
        color: var(--color-gray-300);
        text-transform: uppercase;
        padding-top: 20px;
        padding-bottom: 10px;
    }

    div.projects-container {
        display: grid;
        justify-content: center;
        overflow: auto;
        gap: 30px;
        grid-template-columns: repeat(
            auto-fill,
            minmax(var(--card-height), 1fr)
        );
        /* padding-right: 20px; */ /* Looks better with padding and scrollbar, but ugly with padding and no scrollbar */
        padding-bottom: 20px;
        padding-top: 10px;
    }
    
    div.create-new-container {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: hsla(0deg 0% 0% / 0.25);
        z-index: 2;
        cursor: default;
    }
    
    div.create-new-container div.exit-click-container {
        position: absolute;
        width: 100%;
        height: 100%;
    }
    
    div.create-new-container main.background {
        width: clamp(50%, 650px, 75%);
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: stretch;
        background-image: linear-gradient(
            45deg,
            var(--color-yellow-dark),
            var(--color-yellow-light)
        );
        min-height: 200px;
        height: fit-content;
        border-radius: 20px;
        transition: 0.1s cubic-bezier(0.165, 0.84, 0.44, 1) all;
    }
    
    div.create-new-container div.content {
        max-width: 100%;
        position: relative;
        display: flex;
        flex: 1;
        flex-direction: column;
        background-color: var(--color-gray-700);
        margin: 6px;
        padding: 12px;
        padding-right: 40px;
        border-radius: 14px;
        color: white;
    }
    
    div.create-new-container div.icon-container {
        position: absolute;
        top: 0;
        right: 0;
        color: var(--color-gray-300);
        margin: 10px;
        font-size: 1.25rem;
        cursor: pointer;
    }
    
    div.create-new-container div.icon-container:hover {
        color: white;
    }
    
    div.create-new-container div.content h1 {
        font-weight: 700;
        font-size: 1.25rem;
    }
    
    div.create-new-container div.content div.details-container {
        display: grid;
        grid-template-columns: max-content 1fr;
        align-items: center;
        gap: 10px 30px;
        margin-top: 10px;
    }
    
    div.create-new-container div.content div.details-container input {
        background-color: var(--color-gray-900);
        color: var(--color-gray-100);
        padding: 8px;
        border-radius: 6px;
        /* font-family: 'Lato', Arial, Helvetica, sans-serif; */
        border: 2px solid var(--color-gray-500);
    }
    
    div.create-new-container div.content div.details-container h2 {
        color: var(--color-gray-300);
    }
    
    div.create-new-container div.content div.details-container h2.create-button {
        color: var(--color-yellow-light);
        margin-top: 10px;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 1.5rem;
        grid-column: 1 / 3;
        justify-self: center;
        cursor: pointer;
        transition: 0.2s ease-in-out color;
    }
    
    div.create-new-container div.content div.details-container h2.create-button:hover {
        color: var(--color-yellow-dark);
    }
    
    div.create-new-container div.content div.details-container h2.create-button.invalid {
        --color-gray-disabled: var(--color-gray-500);
        color: var(--color-gray-disabled);
        cursor: not-allowed;
        user-select: none;
    }

    div.create-new-container div.content div.details-container h2.create-button.invalid:hover {
        color: var(--color-gray-disabled);
    }
    
</style>

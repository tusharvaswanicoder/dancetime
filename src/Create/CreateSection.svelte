<script>
    import CreateProjectPage from "./CreateProjectPage.svelte";
    import EditorPage from "./EditorPage.svelte";
    import { CREATE_STATE, createStateStore } from "../stores"
    
    let selectedProject;
    
    const OpenProject = (project) => {
        selectedProject = project;
        createStateStore.set(CREATE_STATE.EDITOR_VIEW);
    }
    
    const ExitEditor = () => {
        selectedProject = null;
        createStateStore.set(CREATE_STATE.PROJECTS_VIEW);
    }
    
</script>

<main>
    {#if $createStateStore == CREATE_STATE.PROJECTS_VIEW}
        <CreateProjectPage OpenProject={OpenProject} />
    {:else if $createStateStore == CREATE_STATE.EDITOR_VIEW}
        <EditorPage ExitEditor={ExitEditor} />
    {/if}
</main>


<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: var(--color-gray-900);
    }
</style>
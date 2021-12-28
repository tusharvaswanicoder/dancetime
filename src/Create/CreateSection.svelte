<script>
    import CreateProjectPage from "./CreateProjectPage.svelte";
    import EditorPage from "./EditorPage.svelte";
    import LoadingEditorPage from './LoadingEditorPage.svelte';
    import { onMount } from "svelte";
    import {
        createCanvas,
        createVideo,
        createAudio,
        createVideoCurrentTime,
        createWaveSurfer,
        createLoadingThumbnailsPercent,
        createThumbnailURLs,
        createProject,
        createCTX,
        createProjectUnsaved,
        createAAInProgress,
        createEditorDisabled,
        createTabState,
        createMediaLoaded,
        createLoadingFinished,
        createLoadingMediaPercent,
        createVideoPlayer,
        createSelectedComponent,
        createSelectedComponentIndex
    } from "../stores";
    
    const CREATE_STATE = {
        PROJECTS_VIEW: 1,
        EDITOR_VIEW: 2,
        LOADING_EDITOR_VIEW: 3
    }
    
    const ResetCreateStateProject = () => {
        $createCanvas = null;
        $createCTX = null;
        $createVideoPlayer = null;
        $createVideo = null;
        $createAudio = null;
        $createVideoCurrentTime = 0;
        $createWaveSurfer = null;
        $createLoadingThumbnailsPercent = 0;
        $createLoadingMediaPercent = 0;
        $createMediaLoaded = false;
        $createLoadingFinished = false;
        $createThumbnailURLs = {};
        $createProject = null;
        $createProjectUnsaved = false;
        $createAAInProgress = false;
        $createEditorDisabled = false;
        $createTabState = null;
        $createSelectedComponent = {};
        $createSelectedComponentIndex = -1;
    }

    onMount(() => {
        ResetCreateStateProject();
    })
    
    let createState = CREATE_STATE.PROJECTS_VIEW;

    const OpenProject = (project) => {
        ResetCreateStateProject();
        $createProject = project;
        createState = CREATE_STATE.LOADING_EDITOR_VIEW;
    }
    
    const ExitEditor = () => {
        createState = CREATE_STATE.PROJECTS_VIEW;
        setTimeout(() => {
            ResetCreateStateProject();
        }, 500);
    }
    
    let displayEditorLoadingPage = true;
    $: {
        displayEditorLoadingPage = 
            (createState == CREATE_STATE.LOADING_EDITOR_VIEW || createState == CREATE_STATE.EDITOR_VIEW)
            && !$createLoadingFinished
    }
    
    $: {
        if ($createMediaLoaded) {
            createState = CREATE_STATE.EDITOR_VIEW;
        }
    }

</script>

<main>
    {#if displayEditorLoadingPage}
        <LoadingEditorPage ExitEditor={ExitEditor} />
    {/if}
    {#if createState == CREATE_STATE.PROJECTS_VIEW}
        <CreateProjectPage OpenProject={OpenProject} />
    {:else if createState == CREATE_STATE.EDITOR_VIEW}
        <EditorPage ExitEditor={ExitEditor} />
    {/if}
</main>

<style>
    /* #video-player {
        position: relative;
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
        border-radius: 20px;
    } */

    main {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: var(--color-gray-900);
    }
</style>
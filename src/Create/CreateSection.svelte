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
        createVideoDuration,
        createWaveSurfer,
        createVideoFPS,
        createLoadingThumbnailsPercent,
        createThumbnailURLs,
        createProject,
        createCTX,
        createProjectUnsaved,
        createAAInProgress,
        createEditorDisabled,
        createFramesAnalyzed,
        createTabState,
        createMediaLoaded,
        createLoadingFinished,
        createLoadingMediaPercent
    } from "../stores";
    
    const CREATE_STATE = {
        PROJECTS_VIEW: 1,
        EDITOR_VIEW: 2,
        LOADING_EDITOR_VIEW: 3
    }
    
    let yt;
    
    onMount(() => {
        $createCanvas = null;
        $createVideo = null;
        $createAudio = null;
        $createVideoCurrentTime = null;
        $createVideoDuration = null;
        $createWaveSurfer = null;
        $createVideoFPS = 30;
        $createLoadingThumbnailsPercent = 0;
        $createLoadingMediaPercent = 0;
        $createMediaLoaded = false;
        $createThumbnailURLs = {};
        $createLoadingFinished = false;
        
        window.addEventListener("message", (event) => {
            console.log('got message in svelte')
            // console.log(event.origin); // Always verify identity using origin and source
            console.log(event);
        }, false);
    })
    
    let createState = CREATE_STATE.PROJECTS_VIEW;

    const OpenProject = (project) => {
        if ($createProject) {
            return;
        }
        
        $createProject = project;
        $createLoadingFinished = false;
        $createLoadingThumbnailsPercent = 0;
        $createThumbnailURLs = {};
        $createLoadingMediaPercent = 0;
        createState = CREATE_STATE.LOADING_EDITOR_VIEW;
    }
    
    const ExitEditor = () => {
        createState = CREATE_STATE.PROJECTS_VIEW;
        setTimeout(() => {
            $createCanvas = null;
            $createCTX = null;
            $createVideo = null;
            $createAudio = null;
            $createVideoCurrentTime = 0;
            $createVideoDuration = 0;
            $createWaveSurfer = null;
            $createVideoFPS = 30;
            $createLoadingThumbnailsPercent = 0;
            $createLoadingMediaPercent = 0;
            $createThumbnailURLs = {};
            $createProject = null;
            $createProjectUnsaved = false;
            $createAAInProgress = false;
            $createEditorDisabled = false;
            $createFramesAnalyzed = {};
            $createTabState = null;
            $createProject = null;
            $createMediaLoaded = false;
            $createLoadingFinished = false;
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

    const TestClickButton = () => {
        top.postMessage({
            event_name: 'dancetime-message:start-analysis',
            source: 'dancetime-main',
            data: {
                text: 'nothing useful here'
            }
        })
    }
    
</script>

<button on:click={() => TestClickButton()}>Test Button</button>
<iframe bind:this={yt} width="560" height="315" src="https://www.youtube.com/embed/mQiHypmwLzQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
</iframe>

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
    main {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: var(--color-gray-900);
    }
</style>
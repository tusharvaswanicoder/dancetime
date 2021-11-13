<script>
    import CreateProjectPage from "./CreateProjectPage.svelte";
    import EditorPage from "./EditorPage.svelte";
    import { onMount } from "svelte";
    import {
        createCanvas,
        createVideo,
        createAudio,
        createVideoCurrentTime,
        createVideoDuration,
        createWaveSurfer,
        createVideoFPS,
        createLoadingPercent,
        createThumbnailURLs,
        createProject
    } from "../stores";
    
    const CREATE_STATE = {
        PROJECTS_VIEW: 1,
        EDITOR_VIEW: 2
    }
    
    onMount(() => {
        $createCanvas = null;
        $createVideo = null;
        $createAudio = null;
        $createVideoCurrentTime = null;
        $createVideoDuration = null;
        $createWaveSurfer = null;
        $createVideoFPS = 30;
        $createLoadingPercent = 0;
        $createThumbnailURLs = {};
    })
    
    let createState = CREATE_STATE.PROJECTS_VIEW;

    const OpenProject = (project) => {
        $createLoadingPercent = 0;
        $createProject = project;
        createState = CREATE_STATE.EDITOR_VIEW;
    }
    
    const ExitEditor = () => {
        $createProject = null;
        createState = CREATE_STATE.PROJECTS_VIEW;
    }
    
</script>

<main>
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
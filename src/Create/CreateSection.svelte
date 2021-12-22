<script>
    import CreateProjectPage from "./CreateProjectPage.svelte";
    import EditorPage from "./EditorPage.svelte";
    import LoadingEditorPage from './LoadingEditorPage.svelte';
    import { onMount } from "svelte";
    import { GetVideoMetadataFromYouTube } from './GetVideoMetadata';
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
        createLoadingMediaPercent,
        createVideoPlayer
    } from "../stores";
    
    const CREATE_STATE = {
        PROJECTS_VIEW: 1,
        EDITOR_VIEW: 2,
        LOADING_EDITOR_VIEW: 3
    }
    
    // import YouTubePlayer from 'youtube-player';
    // let player;
    
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
        $createVideoPlayer = null;

    // player = YouTubePlayer('video-player', {
    //     playerVars: {
    //         controls: 0,
    //         disablekb: 1,
    //         autoplay: 1,
    //         enablejsapi: 1,
    //         fs: 0,
    //         modestbranding: 1,
    //         origin: document.domain,
    //         rel: 0,
    //         showinfo: 0,
    //         autoplay: 0,
    //         frameborder: 0,
    //         iv_load_policy: 3
    //     }
    // });
    
    // player.loadVideoById('mQiHypmwLzQ');

    //     window.addEventListener("message", (event) => {
    //         console.log('got message in svelte')
    //         // console.log(event.origin); // Always verify identity using origin and source
    //         console.log(event);
    //     }, false);
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



    // const TestClickButton = async () => {
    //     if (await player.getPlayerState() == 1) {
    //         player.pauseVideo();
    //     } else {
    //         player.playVideo();
    //     }
    // }
    
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
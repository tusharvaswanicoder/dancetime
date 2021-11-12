<script>
    import Icon from '../Icon.svelte';
    import VideoPreview from './VideoPreview.svelte'
    import { createCanvas, createVideo, createAudio } from '../stores';
    import { dlManager } from '../Downloads/DownloadManager';
    import { keyPress, keyDown, createVideoFPS } from '../stores'
    import VideoPreviewSeeker from './VideoPreviewSeeker.svelte'
    
    const NavToBeginning = () => {
        $createVideo.currentTime = 0;
        $createAudio.currentTime = 0;
    }
    
    const NavToEnd = () => {
        $createVideo.currentTime = $createVideo.duration;
        $createAudio.currentTime = $createAudio.duration;
    }
    
    const NavToPrevFrame = () => {
        $createVideo.pause();
        $createVideo.currentTime -= 1 / $createVideoFPS;
        $createAudio.currentTime = $createVideo.currentTime;
    }
    
    const NavToNextFrame = () => {
        $createVideo.pause();
        $createVideo.currentTime += 1 / $createVideoFPS;
        $createAudio.currentTime = $createVideo.currentTime;
    }
    
    const PlayOrPause = () => {
        $createAudio.currentTime = $createVideo.currentTime; 
        if ($createVideo.paused) {
            $createVideo.play();
        } else {
            $createVideo.pause();
        }
    }
    
    const updatePausePlayIcons = () => {
        icons['video_play_icon'].display = $createVideo.paused;
        icons['video_pause_icon'].display = !$createVideo.paused;
    }
    
    const onVideoPaused = () => {
        updatePausePlayIcons();
    }
    
    const onVideoPlayed = () => {
        updatePausePlayIcons();
    }
    
    const icons = {
        ['video_beginning_icon']:   {tooltip: 'Skip to Beginning', display: true, func: NavToBeginning},
        ['video_prev_frame_icon']:  {tooltip: 'Previous Frame (Left Arrow)', display: true, func: NavToPrevFrame},
        ['video_play_icon']:        {tooltip: 'Play (Space)', display: true, func: PlayOrPause},
        ['video_pause_icon']:       {tooltip: 'Pause (Space)', display: false,func: PlayOrPause},
        ['video_next_frame_icon']:  {tooltip: 'Next Frame (Right Arrow)', display: true, func: NavToNextFrame},
        ['video_end_icon']:         {tooltip: 'Skip to End', display: true, func: NavToEnd},
        
    }
    
    const ClickNavIcon = (icon_name) => {
        const icon = icons[icon_name];
        if (icon) {
            icon.func(icon_name);
        }
    }
    
    const RefreshFPS = (project) => {
        if (!project) {
            return;
        }
        
        const metadata = dlManager.metaData[project.media_id];
        if (!metadata) {
            return;
        }
        
        createVideoFPS.set(metadata.fps);
    }
    
    const onKeyPress = (e) => {
        if (e.key == " ") {
            PlayOrPause();
        }
    }
    
    const onKeyDown = (e) => {
        if (e.key == "ArrowLeft") {
            NavToPrevFrame();
        } else if (e.key == "ArrowRight") {
            NavToNextFrame();
        }
    }
    
    $: {
        onKeyPress($keyPress)
    }
    
    $: {
        onKeyDown($keyDown)
    }
    
    $: {
        $dlManager,
        RefreshFPS(project)
    }
    
    export let project;
</script>

{#if project}
    <main>
        <div class='title'>{project.project_name}</div>
        <VideoPreview {project} {onVideoPaused} {onVideoPlayed} />
        <div class='nav-and-seek'>
            <VideoPreviewSeeker />
            <div class='video-nav'>
                <div class='nav-icons'>
                    {#each Object.entries(icons) as [icon_name, entry]}
                        {#if entry.display}
                            <div class='icon-container' title={entry.tooltip}>
                                <Icon name={icon_name} OnClick={ClickNavIcon} />
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </main>
{/if}

<style>
    
    main {
        position: relative;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: min-content min-content 1fr;
        padding: 6px;
        padding-left: 40px;
        padding-right: 40px;
        text-align: center;
        height: 100%;
    }
    
    main div.title {
        color: var(--color-gray-300);
        font-size: 22px;
        cursor: default;
        margin-bottom: 8px;
    }
    
    main div.video-nav {
        font-size: 2rem;
        color: var(--color-gray-100);
    }
    
    div.nav-icons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin: 10px;
    }
    
    div.nav-icons div.icon-container {
        cursor: pointer;
    }
    
    div.nav-icons div.icon-container:active {
        transform: scale(1.1);
    }
    
    div.nav-and-seek {
        align-self: center;
    }
    
</style>
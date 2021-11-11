<script>
    import { onDestroy, onMount } from 'svelte';
    import WaveSurfer from 'wavesurfer.js';
    import { dlManager } from "../Downloads/DownloadManager"
    import { GetVideoBlobFromDB } from "../Downloads/VideoBlobManager"
    import { createWaveSurfer, createVideo, createAudio, createVideoCurrentTime, createVideoDuration, createVideoFPS } from '../stores';
    import Icon from '../Icon.svelte';
    export let project;
    
    const ConvertDurationToNiceString = (duration) => {
        if (!duration) {
            return '00:00:00';
        }
        const minutes = Math.floor(duration / 60).toFixed(0).toString().padStart(2, '0');
        const seconds = Math.floor(duration % 60).toFixed(0).toString().padStart(2, '0');
        const frames = Math.floor((duration % 60 % 1) * $createVideoFPS).toFixed(0).toString().padStart(2, '0');;
         
        return `${minutes}:${seconds}:${frames}`;
    };
    
    const updateAudioBlob = () => {
        if (!project) {
            return;
        }

        const blob_name =
            dlManager.metaData[project.media_id]['indexedMediaBlob-a'];
            
        if (!blob_name) {
            return;
        }    
        
        GetVideoBlobFromDB(blob_name, (blob) => {
            $createWaveSurfer.loadBlob(blob);
        });
    };
    
    onMount(() => {
        createWaveSurfer.set(WaveSurfer.create({
            container: '#waveform',
            waveColor: 'rgb(38, 126, 97)',
            progressColor: 'rgb(77, 189, 152)',
            interact: false,
            height: 50,
            responsive: true,
            hideScrollbar: true
        }));
        
        $createWaveSurfer.setMute(true);
        
        updateAudioBlob();
    })
    
    onDestroy(() => {
        if (!$createWaveSurfer) {return;}
        $createWaveSurfer.destroy();
        createWaveSurfer.set(null);
    })
    
    const updateWaveSurferCurrentTime = (time) => {
        if (!$createWaveSurfer) {return;}
        $createWaveSurfer.setCurrentTime(time);
    }
    
    let width = 0;
    
    const onClickTimeline = (e) => {
        const percentClick = e.layerX / (width - 20); // - 20 because there is 10px of padding on either side
        $createVideo.currentTime = percentClick * $createVideoDuration;
        $createAudio.currentTime = percentClick * $createVideoDuration;
        createVideoCurrentTime.set($createVideo.currentTime);
    }
    
    $: {
        project,
        updateAudioBlob()
    }
    
    let seekerProgressPercent = '0%';
    
    $: {
        seekerProgressPercent = `${$createVideoCurrentTime / $createVideoDuration * 100}%`
    }
    
    $: {
        updateWaveSurferCurrentTime($createVideoCurrentTime)
    }
    
</script>

<main on:click={onClickTimeline} bind:clientWidth={width}>
    <div class='lines'>
        <div class='lines-container'>
            {#each {length: 20} as _, i}
                <div class='line'></div>
            {/each}
        </div>
        <div class='timestamp left'>{ConvertDurationToNiceString($createVideoCurrentTime)}</div>
        <div class='timestamp right'>{ConvertDurationToNiceString($createVideoDuration)}</div>
    </div>
    <div class='timeline-container'>
        <div class='thumbnails'></div>
        <div class='keyframes'></div>
        <div class='waveform' id="waveform"></div>
        <div class='seeker' style={`left: ${seekerProgressPercent}`}>
            <div class='head'><Icon name={'create_seeker_head'} /></div>
            <div class='tail'></div>
        </div>
    </div>
</main>

<style>
    main {
        height: 100%;
        width: 100%;
        position: relative;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 20px 1fr;
        padding: 10px;
    }
    
    div.timeline-container {
        grid-column: 1 / -1;
        grid-row: 2 / -1;
        display: grid;
        position: relative;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 25px 50px;
        grid-template-areas:
            'thumbnails'
            'keyframes'
            'waveform';
        background-color: var(--color-gray-1000);
        border: 1px solid var(--color-gray-500);
        /* border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px; */
        min-height: 0;
    }
    
    div.lines {
        grid-column: 1 / -1;
        grid-row: 1 / 2;
        position: relative;
    }
    
    div.lines div.timestamp {
        position: absolute;
        top: 0;
        font-size: 12px;
        padding: 2px;
        color: var(--color-gray-500);
        cursor: default;
    }
    
    div.lines div.timestamp.left {
        left: 0;
    }
    
    div.lines div.timestamp.right {
        right: 0;
    }
    
    div.lines div.lines-container {
        display: grid;
        grid-template-columns: repeat(20, 1fr);
        grid-template-rows: 1fr;
        justify-content: space-between;
        align-items: center;
        border-right: 1px solid var(--color-gray-500);
        width: 100%;
        height: 100%;
    }
    
    div.lines div.lines-container div.line {
        width: 1px;
        height: 100%;
        background-color: var(--color-gray-500);
    }
    
    div.thumbnails {
        grid-area: thumbnails;
    }
    
    div.keyframes {
        grid-area: keyframes;
    }
    
    div.waveform {
        grid-area: waveform;
        position: relative;
    }
    
    div.seeker {
        position: absolute;
        --seeker-head-height: 20px;
        height: calc(100% + var(--seeker-head-height));
        top: calc(-1 * var(--seeker-head-height));
        left: 0%;
        --seeker-color: var(--color-yellow-light);
        color: var(--seeker-color);
        font-size: var(--seeker-head-height);
        z-index: 5;
        transform: translateX(-2px);
    }
    
    div.seeker div.head {
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
    }
    
    div.seeker div.tail {
        width: 2px;
        height: 100%;
        background-color: var(--seeker-color);
    }
</style>
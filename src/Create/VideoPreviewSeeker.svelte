<script>
    import { createVideo, createAudio, createVideoCurrentTime, createVideoDuration, createVideoFPS } from '../stores';
    
    const ConvertDurationToNiceString = (duration) => {
        if (!duration) {
            return '00:00:00';
        }
        const minutes = Math.floor(duration / 60).toFixed(0).toString().padStart(2, '0');
        const seconds = Math.floor(duration % 60).toFixed(0).toString().padStart(2, '0');
        const frames = Math.floor((duration % 60 % 1) * $createVideoFPS).toFixed(0).toString().padStart(2, '0');;
         
        return `${minutes}:${seconds}:${frames}`;
    };
    
    let width = 0;
    let progressBarPercent = 0;
    
    const onClickProgressBar = (e) => {
        const percentClick = e.layerX / width; 
        $createVideo.currentTime = percentClick * $createVideoDuration;
        $createAudio.currentTime = percentClick * $createVideoDuration;
        createVideoCurrentTime.set($createVideo.currentTime);
    }
    
    const GetProgressBarPercent = () => {
        if (!$createVideoCurrentTime || !$createVideoDuration) {
            return 0;
        }
        
        return ($createVideoCurrentTime / $createVideoDuration) * 100;
    }
    
    $: {
        $createVideo,
        $createVideoCurrentTime,
        progressBarPercent = GetProgressBarPercent()
    }

</script>

<main>
    {#if $createVideo}
        <div>{ConvertDurationToNiceString($createVideoCurrentTime)}</div>
        <div bind:clientWidth={width} class='progress' on:click={onClickProgressBar}>
            <div style={`width: ${progressBarPercent}%`}></div>
        </div>
        <div>{ConvertDurationToNiceString($createVideoDuration)}</div>
    {/if}
</main>

<style>
    main {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        color: var(--color-gray-300);
        font-size: 1rem;
        margin-bottom: 6px;
        margin-top: 12px;
        cursor: default;
    }
    
    div.progress, div.progress div {
        height: 6px;
        background-color: var(--color-gray-500);
        border-radius: 50px;
        width: 100%;
    }
    
    div.progress div {
        background-color: var(--color-yellow-light);
    }
</style>
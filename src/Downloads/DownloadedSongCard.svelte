<script>
    import ProgressCircle from "../ProgressCircle.svelte";
    import Icon from "../Icon.svelte"
    export let songData = {};
    
    const ConvertDurationToNiceString = (duration) => {
        return `${Math.floor(duration / 60)}:${duration % 60}`
    }
    
    const GetTotalMB = () => {
        return ((songData['filesize-v'] + songData['filesize-a']) / (1024 * 1024)).toFixed(0);
    }
    
    const GetFormattedDate = (_date) => {
        const date = new Date(_date);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDay()}, ${date.getFullYear()}`;
    }
    
    const OnClickDelete = (e) => {
        
    }
</script>

<main>
    <a href={songData.url} target="_blank">
        <div class='image-container'>
            <!-- Image here -->
            <div class='duration'>{ConvertDurationToNiceString(songData.duration)}</div>
        </div>
    </a>
    <div class='text-container'>
        <header>
            <h1>{songData.title}</h1>
            <h2>{songData.channel}</h2>
        </header>
        <footer>
            <h2>Downloaded: {GetFormattedDate(songData.download_date)}</h2>
            {#if songData.last_played}
                <h2>{songData.last_played}</h2>
            {/if}
        </footer>
    </div>
    <div class='right-container'>
        <div class='circle-container'>
            <ProgressCircle 
            stops={[
                { color: 'var(--color-blue-dark)', offset: '0' },
                { color: 'var(--color-blue-light)', offset: '1' },
            ]} value={50}><span>{GetTotalMB()} MB</span></ProgressCircle>
        </div>
        <div class='icon-container delete' on:click={() => OnClickDelete()}>
            <Icon name="trash_icon" />
        </div>
    </div>
</main>

<style>
    main {
        background-color: var(--color-gray-100);
        padding: 20px;
        border-radius: 10px;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.25);
        display: grid;
        grid-template-columns: min-content 1fr min-content;
        gap: 26px;
    }
    
    div.image-container {
        height: 180px;
        width: 320px;
        border-radius: 14px;
        background-color: var(--color-gray-300);
        position: relative;
    }
    
    div.duration {
        position: absolute;
        background-color: var(--color-gray-900);
        color: white;
        font-weight: 700;
        padding: 6px;
        padding-left: 8px;
        padding-right: 8px;
        border-radius: 6px;
        font-size: 14px;
        cursor: default;
        bottom: -8px;
        right: -8px;
    }
    
    h1 {
        font-size: 26px;
    }
    
    h2 {
        margin-top: 6px;
        font-size: 18px;
        color: var(--color-gray-700);
    }
    
    div.text-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: default;
    }
    
    footer {
        color: var(--color-gray-500);
    }
    
    div.right-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-between;
    }
    
    div.circle-container {
        width: 120px;
        height: 120px;
        --progress-trackcolor: var(--color-gray-200);
        --progress-color: var(--color-blue-dark);
    }
    
    div.circle-container span {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: fit-content;
        height: fit-content;
        margin: auto;
        font-weight: 700;
        font-size: 20px;
        cursor: default;
    }
    
    div.icon-container {
        color: var(--color-gray-300);
        font-size: 2rem;
        cursor: pointer;
    }
    
    div.icon-container:hover {
        color: var(--color-gray-500);
    }
    
</style>
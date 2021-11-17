<script>
    import { dlManager } from "./DownloadManager"
    import DownloadedSongCard from "./DownloadedSongCard.svelte";
    
    const GetTotalSizeInMB = () => {
        let size = 0;
        Object.values($dlManager).forEach((entry) => {
            if (entry['filesize-v'] && entry['filesize-a']) {
                size += entry['filesize-v'] + entry['filesize-a'];
            }
        })
        
        // Convert from bytes to MB then remove decimals
        return (size / (1024 * 1024)).toFixed(0);
    }
    
    let numSongs = 0;
    let totalSize = 0;
    
    $: {
        $dlManager,
        totalSize = GetTotalSizeInMB(),
        numSongs = Object.values($dlManager).length
    }
</script>

<main>
    <header>
        <h1>Downloads</h1>
        <div class='right-container'>
            {#if numSongs == 1}
                <h2>{numSongs} Song</h2>
            {:else}
                <h2>{numSongs} Songs</h2>
            {/if}
            <h2>{totalSize > 1000 ? `${(totalSize / 1000).toFixed(2)} GB` : `${totalSize} MB`}</h2>
        </div>
    </header>
    <section class='downloads-container'>
        {#each Object.values($dlManager) as metaDataEntry}
            <DownloadedSongCard songData={metaDataEntry} />
        {/each}
    </section>
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-rows: min-content 1fr;
    }
    
    header {
        padding: 20px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        --shadow-color: 0deg 0% 57%;
        --shadow-elevation-low:
            0px 0.5px 0.5px hsl(var(--shadow-color) / 0.69),
            0px 2.1px 2.2px -3px hsl(var(--shadow-color) / 0.57);
        --shadow-elevation-medium:
            0px 0.5px 0.5px hsl(var(--shadow-color) / 0.64),
            0px 2.5px 2.6px -1.5px hsl(var(--shadow-color) / 0.57),
            0px 10.4px 10.9px -3px hsl(var(--shadow-color) / 0.5);
        --shadow-elevation-high:
            0px 0.5px 0.5px hsl(var(--shadow-color) / 0.6),
            0px 3.5px 3.7px -0.6px hsl(var(--shadow-color) / 0.56),
            0px 7.8px 8.2px -1.2px hsl(var(--shadow-color) / 0.53),
            0px 16px 16.8px -1.8px hsl(var(--shadow-color) / 0.5),
            0.1px 30.7px 32.2px -2.4px hsl(var(--shadow-color) / 0.46),
            0.1px 54.5px 57.2px -3px hsl(var(--shadow-color) / 0.43);
        
        box-shadow: var(--shadow-elevation-medium);
        cursor: default;
        z-index: 1;
    }
    
    h1 {
        font-size: 36px;
        font-weight: 700;
    }
    
    div.right-container {
        display: flex;
        flex-direction: row;
        gap: 20px;
    }
    
    h2 {
        font-weight: 700;
        font-size: 18px;
        background-color: var(--color-gray-200);
        padding: 6px;
        padding-left: 10px;
        padding-right: 10px;
        border-radius: 6px;
    }
    
    section.downloads-container {
        padding: 20px;
        overflow-y: auto;
    }
</style>
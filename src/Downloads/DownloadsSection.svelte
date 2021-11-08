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
    
    function ClickTest() {
        dlManager.startMediaDownload('pdsGv5B9OSQ')
        // dlManager.startMediaDownload('YV2yS3iCWDA')
        // dlManager.startMediaDownload('WfwV8vkIXvI')
        // dlManager.startMediaDownload('sbMzyR9YLLg')
    }
    
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
        <button on:click={() => ClickTest()}>Test download</button>
        {#each Object.values($dlManager) as metaDataEntry}
            <DownloadedSongCard songData={metaDataEntry} />
        {/each}
    </section>
</main>

<main>
    <h1>Downloads</h1>
    <button on:click={() => ClickTest()}>Test download</button>
    {#each Object.values($dlManager) as metaDataEntry}
        <p>{metaDataEntry.title}</p>
    {/each}
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
        box-shadow: 0px 4px 8px 0px hsla(0, 0%, 0%, 0.25);
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
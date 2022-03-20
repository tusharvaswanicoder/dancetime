<script>
    import DanceChartCard from "./DanceChartCard.svelte";
    import { onMount } from 'svelte';
    import LoadingScreen from '../../LoadingScreen.svelte';
    
    let loaded = false;
    let loaded_charts = [];
    
    onMount(() => {
        fetch(`/api/charts/category/newest`)
            .then((res) => res.json())
            .then((res) => {
                loaded_charts = res.charts;
                loaded = true;
            })
            .catch((error) => {
                console.log(error);
            });
    })
</script>

<main class:loaded>
    {#if loaded}
        {#each loaded_charts as chart}
            <DanceChartCard card_data={chart} />
        {/each}
    {:else}
        <div class='loading-container'>
            <LoadingScreen />
        </div>
    {/if}
    <!-- <DanceChartCard card_data={{
        title: 'Test Song Title', 
        song_artist: 'Dua Lipa', 
        choreography: 'MYLEE DANCE', 
        difficulty: 'Easy', 
        video_link: 'https://www.youtube.com/watch?v=kI2g2ARGdHM', 
        video_id: 'kI2g2ARGdHM', 
        duration: 261.72, 
        last_edited: '2021-12-31 20:06:12',
        plays: 112
    }} /> -->
</main>

<style>
    main {
        position: relative;
        width: 100%;
        min-height: 100%;
        height: fit-content;
        padding: 40px;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-content: flex-start;
        gap: 30px;
    }
    
    main:not(.loaded) {
        height: 100%;
    }
    
    div.loading-container {
        width: 100%;
        height: 100%;
    }
</style>
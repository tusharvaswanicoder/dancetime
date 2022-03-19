<script>
    import PlayHeader from "./PlayHeader.svelte";
    import PlaySidebar from "./PlaySidebar.svelte";
    import PlayMain from "./PlayMain.svelte";
</script>

<main>
    <PlayHeader />
    <PlaySidebar />
    <PlayMain />
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-areas: 
            'header header'
            'sidebar main';
        grid-template-columns: 250px 1fr;
        grid-template-rows: 75px 1fr;
    }
    
    
    
</style>
<script>
    import MetadataComponent from './EditComponents/MetadataComponent.svelte';
    import AddNewComponent from './EditComponents/AddNewComponent.svelte';
    import Icon from "../Icon.svelte";
</script>

<main class='restricted'>
    <main class='overflow-container'>
        <MetadataComponent />
        <AddNewComponent />
    </main>
</main>

<style>
    main.restricted {
        width: 100%;
        height: 100%;
        max-height: 100%;
        overflow: auto;
    }
    
    main.overflow-container {
        position: relative;
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 14px;
    }
</style>
<script>
    import MetadataComponent from './EditComponents/MetadataComponent.svelte';
    import AddNewComponent from './EditComponents/AddNewComponent.svelte';
    import VideoInOutPointsComponent from './EditComponents/VideoInOutPointsComponent.svelte';
    import { COMPONENT_TYPE } from '../constants';
    import Icon from "../Icon.svelte";
    import { createProject } from "../stores";
    
    const COMPONENT_TYPE_MAP = {
        [COMPONENT_TYPE.VIDEO_IN_OUT_POINTS]: VideoInOutPointsComponent
    }
    
</script>

<main class='restricted'>
    <main class='overflow-container'>
        <MetadataComponent />
        {#each $createProject.components as component, componentIndex}
            <svelte:component this={COMPONENT_TYPE_MAP[component.type]} {component} {componentIndex} />
        {/each}
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
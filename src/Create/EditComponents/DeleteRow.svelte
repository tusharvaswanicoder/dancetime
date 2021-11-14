<script>
    import Icon from '../../Icon.svelte';
    import { createProject, createProjectUnsaved } from "../../stores";
    export let componentIndex;
    
    const clickDelete = () => {
        $createProjectUnsaved = true;
        $createProject.components.pop(componentIndex);
        $createProject = $createProject;
    }
    
</script>

<main>
    <div class='icon-container' on:click={clickDelete}>
        <Icon name='trash_icon' />
    </div>
</main>

<style>
    main {
        margin-top: 6px;
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: flex-end;
        font-size: 1.25rem;
        color: var(--color-gray-500);
    }
    
    div.icon-container {
        width: fit-content;
        cursor: pointer;
    }
    
    div.icon-container:hover {
        color: var(--color-gray-300);
    }
</style>
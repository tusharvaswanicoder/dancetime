<script>
    import BasicComponent from "./BasicComponent.svelte";
    import { createProject } from "../../stores";
    import { ConvertDurationToNiceString } from "../../utils";
    
    const OnClick = () => {
        
    }
</script>

<BasicComponent {OnClick} title='Metadata'>
    <div class='content-container'>
        <h2>Project Name</h2>
        <input bind:value={$createProject.project_name} placeholder={"Project Name"} />
        <h2>Video ID</h2>
        {#if $createProject.video_link && $createProject.media_id}
            <h3><a href={$createProject.video_link} target="_blank">{$createProject.media_id}</a></h3>
        {:else}
            <h3>--</h3>
        {/if}
        <h2>Length</h2>
        <h3>{$createProject.length == 0 ? '--' : ConvertDurationToNiceString($createProject.length)}</h3>
        <div class='hr' />
        <h2>Chart Title</h2>
        <input bind:value={$createProject.title} placeholder={"Chart Title"} />
        <h2>Song Artist</h2>
        <input bind:value={$createProject.song_artist} placeholder={"Song Artist"} />
        <h2>Difficulty</h2>
        <h3>{$createProject.difficulty}</h3>
        <h2>Tags</h2>
    </div>
</BasicComponent>

<style>
    div.content-container {
        display: grid;
        grid-template-columns: max-content 1fr;
        grid-auto-rows: 1fr;
        gap: 8px 30px;
        margin-top: 10px;
        justify-content: start;
        align-items: center;
    }
    
    div.content-container h2 {
        color: var(--color-gray-300);
    }
    
    div.content-container h3 {
        color: var(--color-gray-100);
    }
    
    div.content-container h3 a {
        color: #4F85ED;
    }
    
    div.hr {
        width: 100%;
        height: 1px;
        align-self: center;
        background-color: var(--color-gray-300);
        grid-column: 1 / 3;
    }
    
    input {
        background-color: var(--color-gray-900);
        color: var(--color-gray-100);
        padding: 6px;
        border-radius: 6px;
        /* font-family: 'Lato', Arial, Helvetica, sans-serif; */
        border: 2px solid var(--color-gray-500);
    }
</style>
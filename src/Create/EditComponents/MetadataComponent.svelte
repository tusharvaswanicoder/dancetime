<script>
    import BasicComponent from "./BasicComponent.svelte";
    import Dropdown from "../../Dropdown.svelte";
    import Icon from "../../Icon.svelte";
    import { createProject, createProjectUnsaved, createVideoFPS, createVideoDuration } from "../../stores";
    import { ConvertDurationToNiceStringWithFPS } from "../../utils";
    import { DIFFICULTY, MAX_PROJECT_TAGS, COMPONENT_TYPE, COMPONENT_DATA } from "../../constants";
    
    const type = COMPONENT_TYPE.METADATA;
    
    const onDifficultyChanged = (difficulty, old_difficulty) => {
        $createProject.difficulty = difficulty;
        metadataChanged();
    }
    
    const metadataChanged = () => {
        $createProjectUnsaved = true;
    }
</script>

<BasicComponent title={COMPONENT_DATA[type].name}>
    <div class='content-container'>
        <h2>Project Name</h2>
        <input bind:value={$createProject.project_name} on:input={metadataChanged} placeholder={"Project Name"} />
        <h2>Video ID</h2>
        {#if $createProject.video_link && $createProject.media_id}
            <h3><a href={$createProject.video_link} target="_blank">{$createProject.media_id}</a></h3>
        {:else}
            <h3>--</h3>
        {/if}
        <h2>Length</h2>
        <h3>{ConvertDurationToNiceStringWithFPS($createVideoDuration, $createVideoFPS)}</h3>
        <div class='hr' />
        <h2>Chart Title</h2>
        <input bind:value={$createProject.title} on:input={metadataChanged} placeholder={"Chart Title"} />
        <h2>Song Artist</h2>
        <input bind:value={$createProject.song_artist} on:input={metadataChanged} placeholder={"Song Artist"} />
        <h2>Difficulty</h2>
        <Dropdown options={Object.values(DIFFICULTY)} onChanged={onDifficultyChanged} selectedOption={$createProject.difficulty} />
        <div class='hr' />
        <h2 class='tags-title'>Tags</h2>
        <div class='tags-container'>
            {#each {length: MAX_PROJECT_TAGS} as _, i}
                <div class='tag-row'>
                    <input bind:value={$createProject.tags[i]} on:input={metadataChanged} />
                </div>
            {/each}
        </div>
    </div>
</BasicComponent>

<style>
    div.content-container {
        display: grid;
        grid-template-columns: max-content 1fr;
        /* grid-auto-rows: 1fr; */
        gap: 8px 30px;
        margin-top: 10px;
        justify-content: start;
        align-items: center;
    }
    
    h2.tags-title {
        margin-top: 0.5rem;
        align-self: flex-start;
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
    
    div.tag-row {
        display: flex;
        width: 100%;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }
    
    div.tag-row:not(:last-child) {
        margin-bottom: 6px;
    }
    
    div.tag-row input {
        flex: 1;
    }
</style>
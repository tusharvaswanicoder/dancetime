<script>
    import { fly } from 'svelte/transition';
    import { createProject, createProjectUnsaved, createProjectPublishing } from '../stores';
    import { ConvertDurationToNiceStringWithDecimal } from '../utils';
    import { VISIBILITY } from '../constants';
    import Icon from '../Icon.svelte';
    import Dropdown from '../Dropdown.svelte';
    import projectManager from './ProjectManager';
    
    const publish_icon_stops = [
        { color: 'var(--color-pink-dark)', offset: '0' },
        { color: 'var(--color-pink-light)', offset: '1' },
    ];
    
    let vb = $createProject.visibility;
    
    const onVisibilityChanged = (visibility) => {
        vb = visibility;
    }

    const publishChart = () => {
        if (vb == VISIBILITY.DRAFT) {
            return;
        }

        if ($createProjectPublishing) {
            return;
        }

        $createProjectPublishing = true;
        fetch('/api/chart/publish', {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },

            //make sure to serialize your JSON body
            body: JSON.stringify({
                chart: {...$createProject, visibility: vb}
            }),
        }).then(async (response) => {
            // Nothing
            response = await response.json();

            if (response.error) {
                // Handle error
            } else if (response.chart) {
                $createProject = {...$createProject, ...response.chart};
                console.log($createProject);
                projectManager.saveProject($createProject);
                $createProjectUnsaved = false;
            }
        }).finally(() => {
            $createProjectPublishing = false;
        })
    }
</script>

<main in:fly|local={{duration: 200, x: 200, delay: 200}} out:fly|local={{duration: 200, x: -200}}>
    <h1>Publish Chart</h1>
    <div class='info'>
        <h2>Chart Title</h2>
        <h3>{$createProject.title || "--"}</h3>
        <h2>Song Artist</h2>
        <h3>{$createProject.song_artist || "--"}</h3>
        <h2>Difficulty</h2>
        <h3>{$createProject.difficulty}</h3>
        <div class='hr' />
        <h2>Length</h2>
        <h3>{$createProject.duration == 0 ? '--' : ConvertDurationToNiceStringWithDecimal($createProject.duration)}</h3>
        <h2>Video ID</h2>
        {#if $createProject.video_link && $createProject.video_id}
            <h3><a href={$createProject.video_link} target="_blank">{$createProject.video_id}</a></h3>
        {:else}
            <h3>--</h3>
        {/if}
        <h2 class='align-top'>Tags</h2>
        <div class='tags-container'>
            {#each $createProject.tags as tag}
                <div class='tag'>{tag}</div>
            {/each}
        </div>
        <div class='hr' />
        <h2>Version</h2>
        <h3>{$createProject.version}</h3>
        <h2>Visibility</h2>
        {#if !$createProjectPublishing}
            <Dropdown options={Object.values(VISIBILITY)} onChanged={onVisibilityChanged} selectedOption={vb} />
        {:else}
            <h3>{vb}</h3>
        {/if}
    </div>
    <div class='title-flex' class:disabled={vb == VISIBILITY.DRAFT}>
        <h1 class='publish-title'>
        {#if !$createProjectPublishing}
            Publish
        {:else}
            Publishing
        {/if}
        </h1>
        <div class='publish-icon' class:progress={$createProjectPublishing} on:click={publishChart}>
            {#if !$createProjectPublishing}
                <Icon name='create_publish_arrow' stops={publish_icon_stops} />
            {:else}
                <div class='loader'></div>
            {/if}
        </div>
    </div>
</main>

<style>
    
    main {
        width: 100%;
        height: 100%;
        padding: 20px;
        cursor: default;
        display: grid;
        grid-template-rows: min-content 1fr 1fr;
        overflow-y: auto;
    }
    
    div.info {
        display: grid;
        grid-template-columns: max-content 1fr;
        align-items: center;
        gap: 10px;
    }
    
    h1 {
        color: var(--color-gray-100);
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 20px;
    }
    
    h1.publish-title {
        font-size: 2.5rem;
        text-transform: uppercase;
        font-weight: 900;
        background: linear-gradient(45deg, var(--color-pink-dark) 0%, var(--color-pink-light) 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline;
    }
    
    div.title-flex {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        justify-content: flex-end;
        align-items: center;
        transition: 0.2s ease-in-out filter;
        user-select: none;
        margin-top: 20px;
        padding-bottom: 20px;
    }
    
    h2 {
        color: var(--color-gray-300);
        padding-right: 3rem;
    }

    h3 {
        color: var(--color-gray-200);
    }

    h3 a {
        color: #4F85ED;
    }
    
    div.hr {
        width: 100%;
        height: 1px;
        align-self: center;
        background-color: var(--color-gray-300);
        grid-column: 1 / 3;
    }
    
    div.publish-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        font-size: 5rem;
        width: 9rem;
        height: 9rem;
        background-color: var(--color-gray-100);
        border-radius: 500px;
        transition: 0.1s ease-in-out transform;
        cursor: not-allowed;
    }
    
    
    div.title-flex:not(.disabled) div.publish-icon {
        cursor: pointer;
    }
    
    div.title-flex:not(.disabled) div.publish-icon:not(.progress):active {
        transform: scale(1.1);
    }

    div.title-flex:not(.disabled) div.publish-icon.progress {
        cursor: wait;
    }

    div.title-flex:not(.disabled) div.publish-icon div.loader {
        width: 90%;
        height: 90%;
        animation: 1.25s linear loader-anim infinite;
        border: 12px solid var(--color-pink-dark);
        border-radius: 500px;
        clip-path: polygon(
            50% 0%,
            100% 0%,
            100% 50%,
            50% 50%
        );
    }

    @keyframes loader-anim {
        0% {transform: rotate(0deg)}
        100% {transform: rotate(360deg);}
    }
    
    div.title-flex.disabled {
        cursor: default;
        filter: grayscale(1);
    }
    
    div.tags-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 6px;
    }
    
    div.tags-container div.tag {
        background-color: var(--color-gray-200);
        border-radius: 8px;
        padding: 6px;
        font-size: 0.85rem;
        color: var(--color-gray-700);
        font-weight: 700;
    }
    
    h2.align-top {
        margin-top: 0.25rem;
        align-self: flex-start;
    }

</style>
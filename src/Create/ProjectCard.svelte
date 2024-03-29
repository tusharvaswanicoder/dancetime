<script>
    import { onMount } from 'svelte';
    import Icon from '../Icon.svelte';
    import { ConvertDurationToNiceString, GetFormattedDate } from '../utils';
    export let card_data = {
        title: 'Create New Project',
        new_project: true,
    };
    
    export let OnClick = () => {};
    export let OnClickOpen = () => {};
    export let OnClickDelete = () => {};
</script>

<main class={`background ${card_data.visibility || ''} ${card_data.error ? 'error' : ''}`}>
    <div class={`content ${card_data.new_project ? 'new' : ''}`} on:click={() => OnClick(card_data)}>
        {#if card_data.new_project}
            <h1>{card_data.title}</h1>
            <div class="icon-container-add">
                <Icon name="plus_icon" />
            </div>
        {:else}
            <h1>{card_data.project_name}</h1>
            <div class='details-container'>
                {#if !card_data.error}
                    <h2>Chart Title</h2>
                    <h3>{card_data.title || "--"}</h3>
                    <h2>Song Artist</h2>
                    <h3>{card_data.song_artist || "--"}</h3>
                    <h2>Difficulty</h2>
                    <h3>{card_data.difficulty}</h3>
                    <div class='hr' />
                    <h2>Last Edited</h2>
                    <h3>{GetFormattedDate(card_data.last_edited)}</h3>
                    <!-- <h2>Video Source</h2>
                    <h3>{card_data.video_source}</h3> -->
                    <h2>Video ID</h2>
                    {#if card_data.video_link && card_data.video_id}
                        <h3><a href={card_data.video_link} target="_blank">{card_data.video_id}</a></h3>
                    {:else}
                        <h3>--</h3>
                    {/if}
                    <h2>Length</h2>
                    <h3>{card_data.duration == 0 ? '--' : ConvertDurationToNiceString(card_data.duration)}</h3>
                    <div class='hr' />
                    <h2>Visibility</h2>
                    <h3>{card_data.visibility}</h3>
                {:else}
                    <h3 class='red'>This video is not available. Please delete this project and try again. Double check the YouTube link to ensure it is correct.</h3>
                {/if}
            </div>
            <div class='icon-container delete' on:click={() => OnClickDelete(card_data)}>
                <Icon name="trash_icon" />
            </div>
            {#if card_data.ready}
                <div class="icon-container open" on:click={() => OnClickOpen(card_data)}>
                    <Icon name="right_arrow_icon" />
                </div>
            {/if}
        {/if}
    </div>
</main>

<style>
    main.background {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: stretch;
        background-image: linear-gradient(
            45deg,
            var(--color-yellow-dark),
            var(--color-yellow-light)
        );
        height: var(--card-height);
        border-radius: 20px;
        transition: 0.1s cubic-bezier(0.165, 0.84, 0.44, 1) all;
        word-wrap: break-word;
        word-break: break-word;
    }
    
    main.background.Draft {
        background-image: none;
        background-color: var(--color-gray-500);
    }

    main.background.error {
        background-image: linear-gradient(
            45deg,
            var(--color-red-dark),
            var(--color-red-light)
        );
    }

    div.content {
        position: relative;
        max-width: 100%;
        display: flex;
        flex: 1;
        flex-direction: column;
        background-color: var(--color-gray-700);
        margin: 6px;
        padding: 12px;
        border-radius: 14px;
        color: var(--color-gray-100);
        transition: 0.2s linear background-color;
        cursor: default;
    }
    
    div.content.new {
        cursor: pointer;
    }
    
    div.content:hover {
        background-color: var(--color-gray-650);
    }

    div.content h1 {
        font-weight: 700;
        font-size: 1.25rem;
        padding-right: 26px;
    }
    
    div.icon-container-add {
        font-size: 7rem;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        align-self: center;
        width: 100%;
    }
    
    div.details-container {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 10px 30px;
        margin-top: 10px;
    }


    main.background.error div.details-container {
        grid-template-columns: 1fr;
    }

    div.details-container h2 {
        color: var(--color-gray-300);
    }
    
    div.details-container h3 {
        color: var(--color-gray-100);
    }
    
    div.details-container h3 a {
        color: #4F85ED;
    }
    
    div.hr {
        width: 100%;
        height: 1px;
        align-self: center;
        background-color: var(--color-gray-300);
        grid-column: 1 / 3;
    }
    
    div.icon-container {
        font-size: 1.5rem;
        position: absolute;
        margin: 10px;
        color: var(--color-gray-300);
        cursor: pointer;
    }
    
    div.icon-container.delete {
        bottom: 0;
        right: 0;
    }
    
    div.icon-container.open {
        top: 0;
        right: 0;
    }
    
    div.icon-container:hover {
        color: var(--color-gray-100);
    }
    
    div.details-container h3.red {
        color: var(--color-red-light);
    }
</style>

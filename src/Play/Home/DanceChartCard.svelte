<script>
    import { ConvertDurationToNiceString, GetRelativeTimeFormat } from '../../utils';
    import Icon from '../../Icon.svelte';
    import { getAvailableThumbnails, getAllYoutubeThumbnailURLs, fetchAnimatedThumbnail } from '../YoutubeThumbnails';
    import { onMount } from 'svelte';
    import { PlayChart } from '../../Ingame/PlayChart';
    
    export let card_data = {};
    let thumbnail;
    
    onMount(async () => {
        // First get all thumbnails to populate the images instantly
        const all_thumbnails = getAllYoutubeThumbnailURLs(card_data.video_id).reverse();
        thumbnail = all_thumbnails[0];
        
        // Then check to see if there are some that are not available and update
        const available_thumbnails = (await getAvailableThumbnails(card_data.video_id)).reverse();
        thumbnail = available_thumbnails[0];
    })
    
    const clickPlayButton = () => {
        PlayChart(card_data, null, false);
    }
</script>

<div class='card'>
    <div class='top-section'>
        <div class='thumbnail-container'>
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src={thumbnail} />
            <!-- Outputs a 404 message when initial thumbnail is not found. TODO: fix this and do not display error -->
        </div>
        <div class='thumbnail_info difficulty'>{card_data.difficulty}</div>
        <div class='thumbnail_info duration'>{ConvertDurationToNiceString(card_data.duration)}</div>
    </div>
    <div class='bottom-section'>
        <div class='title'>{card_data.title}</div>
        <div class='bottom-grid'>
            <div class='left-side'>
                <div class='choreography'>{card_data.choreography}</div>
                <div class='plays-and-publish-time'>{card_data.plays || 0} plays · {GetRelativeTimeFormat(card_data.last_edited)}</div>
            </div>
            <div class='right-side'>
                <div class='playtest-icon-container' on:click={clickPlayButton}>
                    <span class="playtest-icon">
                        <Icon name="video_play_icon" />
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    @mixin lhCrop($line-height) {
        &::before {
            content: '';
            display: block;
            height: 0;
            width: 0;
            margin-top: calc((1 - #{$line-height}) * 0.5em);
        }
    }
    
    div.card {
        --shadow-color: 0deg 0% 61%;
        --shadow-elevation-medium:
            0px 0px 1px hsl(var(--shadow-color) / 0.36),
            0.3px 0.3px 0.5px hsl(var(--shadow-color) / 0.36),
            1.1px 1.1px 1.8px -0.8px hsl(var(--shadow-color) / 0.36),
            2.8px 2.6px 4.3px -1.7px hsl(var(--shadow-color) / 0.36),
            6.8px 6.4px 10.5px -2.5px hsl(var(--shadow-color) / 0.36);
        --shadow-elevation-high:
            0.3px 0.3px 0.5px hsl(var(--shadow-color) / 0.32),
            1.8px 1.8px 2.9px -0.4px hsl(var(--shadow-color) / 0.32),
            3.4px 3.4px 5.4px -0.7px hsl(var(--shadow-color) / 0.32),
            5.6px 5.6px 8.9px -1.1px hsl(var(--shadow-color) / 0.32),
            9px 8.9px 14.2px -1.4px hsl(var(--shadow-color) / 0.32),
            14.1px 13.9px 22.3px -1.8px hsl(var(--shadow-color) / 0.32),
            21.4px 21.1px 33.8px -2.1px hsl(var(--shadow-color) / 0.32),
            31.5px 31.1px 49.8px -2.5px hsl(var(--shadow-color) / 0.32);
        position: relative;
        width: 370px;
        background-color: white;
        border-radius: 10px;
        padding: 10px;
        height: fit-content;
        box-shadow: var(--shadow-elevation-medium);
        cursor: pointer;
        transition: 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) all;
    }
    
    // Use a psuedo element for shadow performance
    div.card::after {
        content: "";
        border-radius: 10px;
        position: absolute;
        z-index: -1;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow: var(--shadow-elevation-high);
        opacity: 0;
        transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    
    div.card:hover {
        transform: scale(1.05);
    }
    
    div.card:hover::after {
        opacity: 1;
    }
    
    div.thumbnail_info {
        font-weight: bold;
        position: absolute;
        margin: 6px;
        padding: 6px;
        color: white;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 4px;
        @include lhCrop(1.2);
        // Hack for fixing the line height so the text isn't vertically off-centered
    }
    
    div.thumbnail_info.difficulty {
        top: 0;
        right: 0;
    }
    
    div.thumbnail_info.duration {
        bottom: 0;
        right: 0;
    }
    
    div.card div.top-section {
        position: relative;
    }
    
    div.card div.thumbnail-container {
        position: relative;
        aspect-ratio: 1280 / 720;
        background-color: #D6D6D6;
        border-radius: 8px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        margin-bottom: 4px;
        overflow: hidden;
    }
    
    div.thumbnail-container img {
        height: 100%;
        width: 100%;
        object-fit: cover;
    }
    
    div.bottom-section div.title {
        height: 2em;
        text-overflow: ellipsis;
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 18px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    div.bottom-section div.left-side {
        color: #585858;
    }
    
    span.playtest-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        width: 2rem;
        height: 2rem;
        border-radius: 50px;
        cursor: pointer;
        color: white;
        background: linear-gradient(
            45deg,
            var(--color-pink-dark) 0%,
            var(--color-pink-light) 100%
        );
    }

    div.playtest-icon-container {
        aspect-ratio: 1 / 1;
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
    }

    div.bottom-grid {
        position: relative;
        display: grid;
        grid-template-columns: 1fr min-content;
    }
</style>
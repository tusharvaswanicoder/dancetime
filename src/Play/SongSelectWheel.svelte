<script>
    import PlayCarousel from "./PlayCarousel.svelte";
    import {
        SONG_WHEEL_CATEGORIES,
        SONG_WHEEL_CATEGORY_INFO,
    } from "../constants";
    import { onMount } from "svelte";
    import { songWheelSelectedCategory, songWheelChartMetadata } from '../stores';
    import { getCategoryColorVars } from '../utils';
    import { getAvailableThumbnails } from './YoutubeThumbnails';

    const thumbnails = {};
    let images_to_display = [];
    let loading_images = false;

    const onClickCategory = (category) => {
        loading_images = true;
        $songWheelSelectedCategory = category;
    }

    onMount(() => {
        $songWheelSelectedCategory = SONG_WHEEL_CATEGORIES.POPULAR;
        refreshChartThumbnails();
    })

    const refreshChartThumbnails = async () => {
        loading_images = true;
        for (const category_id in $songWheelChartMetadata) {
            if (!thumbnails[category_id]) {
                thumbnails[category_id] = {};
            }

            for (const index in $songWheelChartMetadata[category_id]) {
                const chart_metadata = $songWheelChartMetadata[category_id][index];

                if (!thumbnails[category_id][chart_metadata.video_id]) {
                    getAvailableThumbnails(chart_metadata.video_id).then((thumbnail_links) => {
                        thumbnails[category_id][chart_metadata.video_id] = {thumbnail_links, index};
                        refreshImagesToDisplay();
                    })
                }

            }
        }

        loading_images = false;
    }
    
    const refreshImagesToDisplay = () => {
        if (!$songWheelSelectedCategory || !thumbnails[$songWheelSelectedCategory]) {
            return;
        }

        images_to_display = Object.values(thumbnails[$songWheelSelectedCategory])
            .sort((a, b) => a.index - b.index)
            .map((entry) => entry.thumbnail_links);
    }

    $: {
        $songWheelChartMetadata,
        $songWheelSelectedCategory,
        refreshChartThumbnails()
    }
</script>

<main>
    <div class="categories">
        {#each Object.values(SONG_WHEEL_CATEGORIES) as category}
            <div
                class="category"
                class:selected={category == $songWheelSelectedCategory}
                style={getCategoryColorVars(category)}
                on:click={() => onClickCategory(category)}
            >
                {SONG_WHEEL_CATEGORY_INFO[category].title}
            </div>
        {/each}
    </div>
    <PlayCarousel style={getCategoryColorVars($songWheelSelectedCategory)} {loading_images} images={images_to_display} />
</main>

<style>
    main {
        position: relative;
        width: 100%;
    }

    div.categories {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    div.category {
        width: 175px;
        padding: 8px;
        color: white;
        font-weight: 900;
        text-transform: uppercase;
        font-size: 1.25rem;
        background-color: var(--color-gray-200);
        border-radius: 10px;
        text-align: center;
        user-select: none;
        cursor: pointer;
    }

    div.category.selected {
        background: linear-gradient(
            45deg,
            var(--color1) 0%,
            var(--color2) 100%
        );
    }
</style>

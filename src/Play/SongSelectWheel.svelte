<script>
    import PlayCarousel from "./PlayCarousel.svelte";
    import {
        SONG_WHEEL_CATEGORIES,
        SONG_WHEEL_CATEGORY_INFO,
    } from "../constants";
    import { onMount } from "svelte";
    import { songWheelSelectedCategory } from '../stores';
    import { getCategoryColorVars } from '../utils';

    const images = [
        "https://images.unsplash.com/photo-1540324155974-7523202daa3f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZGFuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1547153760-18fc86324498?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZGFuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1535525153412-5a42439a210d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZGFuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1546427660-eb346c344ba5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZGFuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1536129808005-fae894214c73?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8ZGFuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1523450001312-faa4e2e37f0f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8ZGFuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1586211070543-61ae1ad4a665?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8ZGFuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
    ];

    const onClickCategory = (category) => {
        $songWheelSelectedCategory = category;
    }

    onMount(() => {
        $songWheelSelectedCategory = SONG_WHEEL_CATEGORIES.POPULAR;
    })
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
    <PlayCarousel style={getCategoryColorVars($songWheelSelectedCategory)} {images} />
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

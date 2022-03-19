<script>
    import Icon from '../Icon.svelte';
    import { fade } from 'svelte/transition';
    import { songWheelCategoryCurrentIndex, songWheelSelectedCategory, songWheelSelectedChartMetadata } from '../stores';
    import { keyDown } from '../stores';
    import { PlayChart } from '../Ingame/PlayChart';
    export let loading_images = true;
    export let images = [];
    export let style = '';

    const gap = 20;
    const image_size = 150;
    const total_image_size_with_half_gap = image_size + gap / 2;
    const total_image_size_with_gap = image_size + gap;
    let is_even;
    $: is_even = images.length % 2 == 0;
    $: even_offset = is_even ? total_image_size_with_half_gap / 2 : 0;
    $: center_image_index = Math.floor(images.length / 2);
    let current_image_index = 0;
    $: base_transform = `-50% + ${even_offset}px`;

    const play_icon_stops = [
        { color: "var(--color-pink-dark)", offset: "0" },
        { color: "var(--color-pink-light)", offset: "1" },
    ];

    const Navigate = (direction) => {
        if (images.length == 0) {
            return;
        }

        if (direction > 0) {
            current_image_index += direction;
            current_image_index = current_image_index % images.length;
        } else if (direction < 0) {
            current_image_index += direction;
            current_image_index = current_image_index % images.length;
            if (current_image_index < 0) {
                current_image_index = images.length - 1;
            }
        }
    }

    const timeBetweenMoves = 100;
    let lastMoveTime = new Date().getTime();

    const clickImage = (i) => {
        shouldTransition = true;
        current_image_index = i;
    }

    const onKeyDown = (evt) => {
        const timeNow = new Date().getTime();

        if (timeNow - lastMoveTime < timeBetweenMoves) {
            return;
        }

        shouldTransition = true;

        if (evt.key == 'ArrowLeft') {
            Navigate(-1);
        } else if (evt.key == 'ArrowRight') {
            Navigate(1);
        }

        lastMoveTime = timeNow;
    }

    const clickPlayButton = () => {
        if ($songWheelSelectedChartMetadata) {
            PlayChart($songWheelSelectedChartMetadata);
        }
    }

    $: {
        onKeyDown($keyDown)
    }

    let transform;
    $: transform = `${base_transform} + ${(center_image_index - current_image_index + (is_even ? -1 : 0)) * total_image_size_with_gap}px`;

    $: {
        if ($songWheelSelectedCategory) {
            $songWheelCategoryCurrentIndex[$songWheelSelectedCategory] = current_image_index;
        }
    }
    
    let shouldTransition = true;
    $: {
        $songWheelSelectedCategory,
        shouldTransition = false
    }
    
    // Ordering matters since they all have "default.jpg" in them
    const sizemap = {
        ["maxresdefault.jpg"]: "2000w",
        ["mqdefault.jpg"]: "1000w",
        ["hqdefault.jpg"]: "500w",
        ["sddefault.jpg"]: "250w",
        ["default.jpg"]: "100w"
    }
    
    const getSrcSet = (image_urls) => {
        
        const getSizemapFromUrl = (url) => {
            for (const img_size in sizemap) {
                if (url.includes(img_size)) {
                    return sizemap[img_size];
                }
            }
            return sizemap["default.jpg"];
        }
        
        let srcset_str = "";
        
        for (const img_url of image_urls) {
            srcset_str += `${img_url} ${getSizemapFromUrl(img_url)},`
        }
        
        return srcset_str;
    }
</script>

<main style={`--gap: ${gap}px; ${style}`}>
    <div class='images-container' class:transition={shouldTransition} style={`transform: translateX(calc(${transform}));`}>
        {#if images.length > 0}
            {#each images as image_urls, i}
                <div class='image-container' in:fade={{delay: 100 * i}} on:click={() => clickImage(i)} class:selected={i == current_image_index} style={`--image-size: ${image_size}px;`}>
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <img srcset={getSrcSet(image_urls)} src={image_urls[image_urls.length - 1]} />
                    {#if i == current_image_index}
                        <div class='playtest-icon-container' on:click={clickPlayButton}>
                            <span class="playtest-icon">
                                <Icon name="video_play_icon" stops={play_icon_stops} />
                            </span>
                        </div>
                    {/if}
                </div>
            {/each}
        {:else}
            <div class='image-container placeholder' style={`--image-size: ${image_size}px;`}>
                <div class='image-placeholder' />
            </div>
        {/if}
    </div>
    {#if loading_images}
        <div class='no-charts-text'>Loading charts...</div>
    {:else if images.length == 0}
        <div class='no-charts-text'>No charts found for selected category.</div>
    {/if}
</main>

<style>
    main {
        position: relative;
        width: 100%;
        padding-top: 20px;
        padding-bottom: 20px;
        background: linear-gradient(
            45deg,
            var(--color1) 0%,
            var(--color2) 100%
        );
        overflow: hidden;
        display: flex;
        flex-direction: row;
        gap: var(--gap);
    }

    main div.images-container {
        position: relative;
        top: 0;
        left: 50%;
        display: flex;
        flex-direction: row;
        gap: var(--gap);
        transform: translateX(-50%);
        width: fit-content;
    }

    main div.images-container.transition {
        transition: 0.1s ease-in-out transform;
    }

    main div.image-container {
        height: var(--image-size);
        aspect-ratio: 1 / 1;
        border-radius: 12px;
        overflow: hidden;
        background-color: var(--color-gray-200);
        transition: border 0.1s ease-in-out, 0.1s ease-in-out box-shadow, 0.1s ease-in-out transform 0.05s;
        border: 0px solid white;
        cursor: pointer;
    }

    main div.image-container.selected {
        transform: scale(1.15);
        z-index: 1;
        border: 6px solid white;
        box-shadow: 0px 0px 30px 0px hsla(0, 0%, 100%, 1),
                    0px 0px 8px 0px hsla(0, 0%, 100%, 0.75),
                    0px 0px 16px 0px hsla(0, 0%, 100%, 0.75),
                    0px 0px 4px 0px hsla(0, 0%, 100%, 0.75);
    }

    main div.image-container.placeholder {
        cursor: default;
        opacity: 0;
    }

    img, div.image-placeholder {
        height: 100%;
        width: 100%;
        object-fit: cover;
        user-select: none;
        pointer-events: none;
        -webkit-user-drag: none;
    }

    div.playtest-icon-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        transition: 0.05s ease-in-out transform;
    }

    span.playtest-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        width: 2.75rem;
        height: 2.75rem;
        background-color: var(--color-gray-100);
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
    }

    div.playtest-icon-container:hover {
        transform: scale(1.05);
    }

    div.playtest-icon-container:active {
        transform: scale(0.9);
    }

    div.no-charts-text {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        display: grid;
        place-content: center;
        color: rgba(255, 255, 255, 0.5);
        font-weight: bold;
        font-size: 1.5rem;
        user-select: none;
    }

</style>
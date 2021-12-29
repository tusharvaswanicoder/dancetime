<script>
    export let images = [];

    const gap = 20;
    const image_size = 150;
    const total_image_size_with_half_gap = image_size + gap / 2;
    const total_image_size_with_gap = image_size + gap;
    const is_even = images.length % 2 == 0;
    const even_offset = is_even ? total_image_size_with_half_gap / 2 : 0;
    const center_image_index = Math.floor(images.length / 2);
    let current_image_index = center_image_index;
    let base_transform = `-50% + ${even_offset}px`;
    let carouselWidth = 0;

    let transform;
    $: transform = `${base_transform} + ${(center_image_index - current_image_index + (is_even ? -1 : 0)) * total_image_size_with_gap}px`;

    let num_images_on_screen;
    $: num_images_on_screen = Math.ceil(carouselWidth / total_image_size_with_gap);

    const Navigate = (direction) => {
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

</script>

<main on:click={() => Navigate(1)} on:contextmenu|preventDefault={() => Navigate(-1)} style={`--gap: ${gap}px;`}>
    <div class='images-container' bind:clientWidth={carouselWidth} style={`transform: translateX(calc(${transform}));`}>
        {#each images as image_url, i}
            <div class='image-container' class:selected={i == current_image_index} style={`--image-size: ${image_size}px;`}>
                <!-- svelte-ignore a11y-missing-attribute -->
                <img src={image_url} />
            </div>
        {/each}
    </div>
</main>

<style>
    main {
        position: relative;
        width: 100%;
        padding-top: 20px;
        padding-bottom: 20px;
        background: linear-gradient(
            45deg,
            var(--color-pink-dark) 0%,
            var(--color-pink-light) 100%
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
        transition: 0.1s ease-in-out transform;
    }

    main div.image-container {
        height: var(--image-size);
        aspect-ratio: 1 / 1;
        border-radius: 12px;
        overflow: hidden;
        background-color: var(--color-gray-300);
        transition: border 0.1s ease-in-out 0.05s, 0.1s ease-in-out box-shadow 0.05s, 0.1s ease-in-out transform 0.05s;
        border: 0px solid white;
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

    img {
        height: 100%;
        width: 100%;
        object-fit: cover;
    }
</style>
<script>
    import Icon from '../Icon.svelte';
    const img = 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZGFuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60';


    let upvotes_width = 0;
    let upvotes_height = 0;
    let difficulty_width = 0;
    let difficulty_height = 0;


</script>

<main>
    <section></section>
    <section>
        <div class='visual-preview'>
            <img src={img} alt={'Video preview'} />
            <div class='clipped upvotes' style={`--text-height: ${upvotes_height}px; --text-width: ${upvotes_width}px;`}>
                <h3 bind:clientWidth={upvotes_width} bind:clientHeight={upvotes_height}>
                    <Icon name={'create_publish_arrow'} direction={'n'} style={'display: inline; font-size: 1rem;'} />
                    43
                </h3>
            </div>
            <div class='clipped difficulty' style={`--text-height: ${difficulty_height}px; --text-width: ${difficulty_width}px;`}>
                <h3 bind:clientWidth={difficulty_width} bind:clientHeight={difficulty_height}>Hard</h3>
            </div>
        </div>
    </section>
    <section></section>
</main>

<style>
    main {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        padding-top: 20px;
    }

    main section:nth-of-type(1) {
        border: 2px solid red;
    }

    main section:nth-of-type(2) {
        border: 2px solid orange;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    main section:nth-of-type(3) {
        border: 2px solid yellow;
    }

    div.visual-preview {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 16px;
        overflow: hidden;
        border: 8px solid transparent;
        background: linear-gradient(45deg, var(--color-pink-dark), var(--color-pink-light)) border-box;
    }

    div.visual-preview div.clipped {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: inherit;
        user-select: none;
    }

    div.visual-preview div.upvotes {
        --top: 0%;
        --right: calc(100% - var(--text-width) - 4px);
        --bottom: calc(100% - var(--text-height) - 4px);
        --left: 0%;
        clip-path: inset(var(--top) var(--right) var(--bottom) var(--left) round 0 0 8px 0);
    }

    div.visual-preview div.difficulty {
        --top: 0%;
        --right: 0%;
        --bottom: calc(100% - var(--text-height) - 4px);
        --left: calc(100% - var(--text-width) - 4px);
        clip-path: inset(var(--top) var(--right) var(--bottom) var(--left) round 0 0 0 8px);
    }

    div.visual-preview div.clipped h3 {
        position: absolute;
        top: 0;
        color: white;
        font-weight: bold;
        font-size: 1.25rem;
        width: fit-content;
        padding-left: 4px;
        padding-right: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
    }

    div.visual-preview div.clipped.difficulty h3 {
        right: 0;
    }

    div.visual-preview img {
        height: 100%;
        width: 100%;
        object-fit: cover;
        border-radius: 12px;
    }


</style>
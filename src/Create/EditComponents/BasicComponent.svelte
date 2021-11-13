<script>
    export let selected = false;
    export let OnClick = () => {};
</script>

<main class={`background`} class:selected>
    <div class={`content`} on:click={() => OnClick()}>
        <slot></slot>
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
        
        background-image: none;
        background-color: var(--color-gray-500);
    }
    
    main.background.selected {
        background-image: linear-gradient(
            45deg,
            var(--color-yellow-dark),
            var(--color-yellow-light)
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
        color: white;
        transition: 0.2s linear background-color;
        cursor: default;
    }
    
    div.content:hover {
        background-color: var(--color-gray-650);
    }
</style>

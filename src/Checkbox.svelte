<script>
    import Icon from './Icon.svelte';

    export let selected = false;
    export let onChanged = () => {};

    const click = () => {
        onChanged(selected);
        selected = !selected;
    };
</script>

<main>
    <div class='box' on:click={() => click()}>
        {#if selected}
            <div class='icon-container'>
                <Icon name="check_icon" />
            </div>
        {/if}
    </div>
</main>

<style>
    main {
        position: relative;
        --dropdown-bg-color-fallback: var(--color-gray-900);
        --dropdown-bg-color-hover-fallback: var(--color-gray-800);
        --dropdown-border-color-fallback: var(--color-gray-500);
        --dropdown-width-fallback: 100%;
        --dropdown-width: 100%;
        width: var(--dropdown-width, var(--dropdown-width-fallback));
        z-index: 10;
        user-select: none;
    }

    div.box {
        width: 1rem;
        height: 1rem;
        background-color: var(
            --dropdown-bg-color,
            var(--dropdown-bg-color-fallback)
        );
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        position: relative;
        border: 2px solid var(--color-gray-100);
        border-radius: 4px;
    }

    div.icon-container {
        position: absolute;
        top: -40%;
        left: 5%;
        width: 100%;
        height: 100%;
        overflow: visible;
        font-size: 1.1rem;
    }

</style>

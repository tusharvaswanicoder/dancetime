<script>
    import Icon from '../../Icon.svelte';
    export let onClickPrevKeyframe = () => {};
    export let onClickNextKeyframe = () => {};
    export let onClickNewKeyframe = () => {};
</script>

<main>
    <div on:click={onClickPrevKeyframe}>
        <Icon name={'keyframe_arrow_up'} direction={'w'} />
    </div>
    <div on:click={onClickNewKeyframe}>
        <Icon name={'keyframe'} />
    </div>
    <div on:click={onClickNextKeyframe}>
        <Icon name={'keyframe_arrow_up'} direction={'e'} />
    </div>
</main>

<style>
    main {
        width: fit-content;
        height: fit-content;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        justify-self: flex-end;
    }
    
    main > * {
        cursor: pointer;
    }
    
    main > *:hover {
        color: var(--color-gray-200);
    }
    
    main > *:active {
        color: var(--color-gray-100);
    }
</style>
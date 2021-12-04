<script>
    import Icon from '../../Icon.svelte';
</script>

<main>
    <div>
        <Icon name={'keyframe_arrow_up'} direction={'w'} />
    </div>
    <div>
        <Icon name={'keyframe'} />
    </div>
    <div>
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
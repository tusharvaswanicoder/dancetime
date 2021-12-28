<script>
    import Icon from './Icon.svelte';
    export let onClick = () => {};
    export const color = 'var(--color-gray-300)';
    export const hoverColor = 'var(--color-gray-300)';
</script>

<main on:click={onClick} style={`--icon-color: ${color}; --icon-hovercolor: ${hoverColor};`}>
    <Icon name={'create_publish_arrow'} direction={'w'} />
</main>

<style>
    main {
        position: absolute;
        top: 0;
        left: 0;
        margin: 20px;
        padding: 4px;
        color: var(--icon-color, var(--color-gray-500));
        font-size: 3rem;
        cursor: pointer;
    }

    main:hover {
        color: var(--icon-hovercolor, var(--color-gray-300));
    }
</style>
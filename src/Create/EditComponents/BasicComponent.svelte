<script>
    import Icon from '../../Icon.svelte';
    import { slide } from 'svelte/transition'
    import { cubicOut } from 'svelte/easing';
    export let title = '';
    
    export let selected = false;
    let contentElement;
    
    const OnClickTitleBar = () => {
        selected = !selected;
    }
    
    const OnClick = (e) => {
        if (e.target == contentElement && !selected) {
            selected = !selected;
        }
    }
</script>

<main class={`background`} class:selected>
    <div class={`content`} on:click={(e) => OnClick(e)} bind:this={contentElement}>
        <div class='title-bar' on:click={(e) => OnClickTitleBar(e)}>
            <h1>{title}</h1>
            <div class='icon-container'>
                <Icon name='create_component_arrow' direction={selected ? 'n' : 's'} />
            </div>
        </div>
        {#if selected}
            <div class='slot' transition:slide|local={{duration: contentElement.clientHeight, easing: cubicOut}}>
                <slot></slot>
            </div>
        {/if}
    </div>
</main>

<style>
    main.background {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: stretch;
        --background-color1: var(--color-gray-500);
        --background-color2: var(--color-gray-500);
        background-image: linear-gradient(
            45deg,
            var(--background-color1),
            var(--background-color2)
        );
        height: var(--card-height);
        border-radius: 20px;
        transition: 0.1s cubic-bezier(0.165, 0.84, 0.44, 1) all;
        word-wrap: break-word;
        word-break: break-word;
        user-select: none;
    }
    
    main.background.selected {
        --background-color1: var(--color-yellow-dark);
        --background-color2: var(--color-yellow-light);
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
        color: var(--color-gray-100);
        transition: 0.2s linear background-color;
        cursor: default;
    }
    
    main.background:not(.selected) div.content {
        cursor: pointer;
    }
    
    div.content:hover {
        background-color: var(--color-gray-650);
    }
    
    div.title-bar {
        font-weight: 700;
        font-size: 1.25rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        cursor: pointer;
    }
    
    div.icon-container {
        margin-left: auto;
    }
</style>

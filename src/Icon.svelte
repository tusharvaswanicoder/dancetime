<!-- From https://svelte.recipes/components/icon/ -->
<script context="module">
    import pathsByName from './icon-paths';
    export const iconOptions = Object.keys(pathsByName);
    export const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    
    import { gradientIdStore } from "./stores"
</script>

<script>
    export let style = '';
    export let name;
    export let direction = 'n';
    export let stops = [];
    export let OnClick = () => {};
    /**
     * stops = 
     * [
     *  {color: 'red', offset: 0},
     *  {color: 'yellow', offset: 1}
     * ]
     * 
     */
    
    const gradient_id = $gradientIdStore;
    gradientIdStore.update(n => n + 1);
    
    let has_gradient = stops.length > 0;

    $: paths = pathsByName[name] || [];
    $: rotation = directions.indexOf(direction) * 45;
</script>

<svg
    viewBox="0 0 25 25"
    fill-rule="evenodd"
    clip-rule="evenodd"
    style={`transform: rotate(${rotation}deg); ${style}`}
    on:click={() => OnClick(name)}
>
    {#if has_gradient}
        <!-- Has gradient -->
        {#each paths as path}
            <path d={path} fill={`url('#gradient${gradient_id}')`} />
        {/each}
        <defs>
            <linearGradient
                x1="0"
                y1="100%"
                x2="100%"
                y2="0"
                id={`gradient${gradient_id}`}
            >
                {#each stops as grad_stop}
                    <stop offset={grad_stop.offset} stop-color={grad_stop.color} />
                {/each}
            </linearGradient>
        </defs>
    {:else}
        <!-- Does not have gradient -->
        {#each paths as path}
            <path d={path} />
        {/each}
    {/if}
</svg>

<style>
    svg {
        width: 1em;
        height: 1em;
        fill: currentColor;
        overflow: visible;
        transition: 0.2s ease-in-out transform;
        filter: var(--icon-filter, none);
    }
</style>
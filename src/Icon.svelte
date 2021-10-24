<!-- From https://svelte.recipes/components/icon/ -->
<script context="module">
    import pathsByName from './icon-paths';
    export const iconOptions = Object.keys(pathsByName);
    export const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    
    import { writable } from "svelte/store";
    const gradient_id_store = writable(0);
    
	import { draw } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

<script>
    export let name;
    export let direction = 'n';
    export let stops = [];
    /**
     * stops = 
     * [
     *  {color: 'red', offset: 0},
     *  {color: 'yellow', offset: 1}
     * ]
     * 
     */
    
    const gradient_id = $gradient_id_store;
    gradient_id_store.update(n => n + 1);
    
    let has_gradient = stops.length > 0;

    $: paths = pathsByName[name] || [];
    $: rotation = directions.indexOf(direction) * 45;
</script>

<svg transition:draw="{{duration: 5000, delay: 500, easing: quintOut}}"
    viewBox="0 0 25 25"
    fill-rule="evenodd"
    clip-rule="evenodd"
    style={`transform: rotate(${rotation}deg)`}
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
    }
</style>

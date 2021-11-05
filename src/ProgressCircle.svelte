<!-- From https://github.com/stephane-vanraes/svelte-progresscircle -->
<script context="module">
    import { gradientIdStore } from "./stores"
</script>

<script>
    export let value = 0;
    export let max = 100;
    export let stops = [];
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
    
    $: progressPath = () => {
        if (value <= 0) {
            return '';
        } else if (value >= max) {
            return 'M50,5A45 45 0 1 1 49.9999 5';
        } else {
            const angle = Math.PI * 2 * (value / max);
            const x = 50 + Math.cos(angle - Math.PI / 2) * 45;
            const y = 50 + Math.sin(angle - Math.PI / 2) * 45;
            let path = 'M50,5';
            if (angle > Math.PI) {
                path += 'A45 45 0 0 1 50 95';
            }
            path += `A45 45 0 0 1 ${x} ${y}`;
            return path;
        }
    };
</script>

<div>
    <svg viewBox="0 0 100 100">
        <path d="M50,5A45 45 0 1 1 49.9999 5" />
        {#if stops.length > 0}
            <path d={progressPath()} stroke={`url('#gradient${gradient_id}')`} stroke-width="10" />
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
            <path d={progressPath()} />
        {/if}
    </svg>
    <div>
        <slot>
            <span>{value}</span>
        </slot>
    </div>
</div>

<style>
    svg {
        fill: var(--progress-fill, transparent);
        height: 100%;
        position: absolute;
        stroke-linecap: var(--progress-linecap, round);
        width: 100%;
    }
    path:first-child {
        stroke: var(--progress-trackcolor, grey);
        stroke-width: var(--progress-trackwidth, 9px);
    }
    path:last-child {
        stroke: var(--progress-color, lightgreen);
        stroke-width: var(--progress-width, 10px);
    }
    div {
        height: 100%;
        position: relative;
        width: 100%;
    }
    span {
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>

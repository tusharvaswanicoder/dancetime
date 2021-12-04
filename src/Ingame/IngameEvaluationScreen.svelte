<script>
    import { fade, scale } from "svelte/transition";
    import { onMount } from "svelte";
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import { ingameFinalScore } from '../stores';
    
    let score = tweened(0, {
		duration: 8000,
		easing: cubicOut
	});
    
    const delay = 1200;
    
    onMount(() => {
        setTimeout(() => {
            score.set($ingameFinalScore);
        }, delay);
    })
</script>

<main transition:fade={{ duration: 400, easing: cubicOut }}>
    <div class="content">
        <h1 in:scale={{ delay: delay, easing: cubicOut, duration: 8000, start: 0, opacity: 1 }}>
            {($score).toFixed(2)}
        </h1>
    </div>
</main>

<style>
    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background-image: linear-gradient(52.52deg, #E63913 0.07%, #8640CC 23.06%, #5D5DE6 42.11%, #639DF3 69.91%, #F88AED 100.13%);
        z-index: 15;
        display: grid;
        place-items: center;
        cursor: default;
        user-select: none;
        color: var(--color-gray-100);
    }

    div.content {
        display: grid;
        place-items: center;
        gap: 30px;
        width: fit-content;
        max-width: 50%;
        height: fit-content;
    }

    div.content > h1 {
        font-weight: 900;
        text-transform: uppercase;
        font-size: 12rem;
    }

</style>

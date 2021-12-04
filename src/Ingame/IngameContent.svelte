<script>
    import IngameLoadingScreen from "./IngameLoadingScreen.svelte";
    import IngameScreen from "./IngameScreen.svelte";
    import IngameEvaluationScreen from './IngameEvaluationScreen.svelte';
    import { ingameIsLoading, ingameScreenShouldShow, ingameEvalScreenShouldShow } from '../stores';
</script>

<main>
    {#if $ingameIsLoading}
        <IngameLoadingScreen />
    {/if}
    {#if $ingameScreenShouldShow}
        <IngameScreen />
    {/if}
    {#if $ingameEvalScreenShouldShow}
        <IngameEvaluationScreen />
    {/if}
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
    }
</style>
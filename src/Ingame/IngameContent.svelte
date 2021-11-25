<script>
    import IngameLoadingScreen from "./IngameLoadingScreen.svelte";
    import IngameScreen from "./IngameScreen.svelte";
    import { ingameIsLoading, ingameScreenShouldShow } from '../stores';
</script>

<main>
    {#if $ingameIsLoading}
        <IngameLoadingScreen />
    {/if}
    {#if $ingameScreenShouldShow}
        <IngameScreen />
    {/if}
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
    }
</style>
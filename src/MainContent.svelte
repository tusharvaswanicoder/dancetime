<script>
    import { MODE_STATE } from './constants';
    import { modeStateStore } from './stores';
    import PlaySection from './Play/PlaySection.svelte';
    import CreateSection from './Create/CreateSection.svelte';
</script>

<main>
    {#if $modeStateStore == MODE_STATE.PLAY}
        <PlaySection />
    {:else if $modeStateStore == MODE_STATE.CREATE}
        <CreateSection />
    {/if}
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }
</style>

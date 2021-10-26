<script>
    import { NAV_IDS } from './constants';
    import { SelectedNavIdStore } from './stores';
    import PlaySection from './PlaySection.svelte';
    import CreateSection from './Create/CreateSection.svelte';
    import DownloadsSection from './DownloadsSection.svelte';
</script>

<main>
    {#if $SelectedNavIdStore == NAV_IDS.PLAY}
        <PlaySection />
    {:else if $SelectedNavIdStore == NAV_IDS.CREATE}
        <CreateSection />
    {:else if $SelectedNavIdStore == NAV_IDS.DOWNLOADS}
        <DownloadsSection />
    {/if}
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        position: relative;
        grid-area: main;
        overflow: hidden;
    }
</style>

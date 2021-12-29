<script>
    import PlayModes from "./PlayModes.svelte";
    import { modeStateStore, groupmodeStateStore, selectedInitialGamemode } from '../stores';
    import { MODE_STATE, modes, groupmodes, GROUP_STATE } from '../constants';
    import { onMount } from "svelte";

    const selectMode = (section) => {
        // Hardcoded for now
        $modeStateStore = section.state;
        if (section.state == MODE_STATE.CREATE) {
            $modeStateStore = MODE_STATE.CREATE;

            setTimeout(() => {
                $selectedInitialGamemode = true;
            }, 1000);
        }
    }

    const selectPlayMode = (section) => {
        // check section.title
        $groupmodeStateStore = section.state;

        setTimeout(() => {
            $selectedInitialGamemode = true;
        }, 1000);
    }

    // For testing only
    onMount(() => {
        selectMode(modes.find((v) => v.state == MODE_STATE.PLAY));
        selectPlayMode(groupmodes.find((v) => v.state == GROUP_STATE.SOLO));
    })
</script>

<main>
    {#if $modeStateStore == MODE_STATE.PLAY}
        <PlayModes sections={groupmodes} onClick={selectPlayMode} />
    {/if}
    <PlayModes sections={modes} onClick={selectMode} />
</main>
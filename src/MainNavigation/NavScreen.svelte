<script>
    import PlayModes from "./PlayModes.svelte";
    import { modeStateStore, gamemodeStateStore } from '../stores';
    import { MODE_STATE } from '../constants';

    const modes = [
        {title: 'Create', colors: ['var(--color-yellow-dark)', 'var(--color-yellow-light)']},
        {title: 'Play', colors: ['var(--color-pink-dark)', 'var(--color-pink-light)']}
    ];
    const playmodes = [
        // {title: 'Party', colors: ['var(--color-purple-dark)', 'var(--color-purple-light)']},
        {title: 'Couple', colors: ['var(--color-turquoise-dark)', 'var(--color-turquoise-light)']},
        {title: 'Solo', colors: ['var(--color-red-dark)', 'var(--color-red-light)']}
    ]

    const selectMode = (section) => {
        // Hardcoded for now
        if (section.title == 'Play') {
            $modeStateStore = MODE_STATE.PLAY;
        } else if (section.title == 'Create') {
            $modeStateStore = MODE_STATE.CREATE;
        }
    }

    const selectPlayMode = (section) => {
        // check section.title
    }
</script>

<main>
    {#if $modeStateStore == MODE_STATE.PLAY}
        <PlayModes sections={playmodes} onClick={selectPlayMode} />
    {/if}
    <PlayModes sections={modes} onClick={selectMode} />
</main>
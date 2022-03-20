<script>
    import { onMount } from 'svelte';
    import Icon from './Icon.svelte';
    import { slide } from 'svelte/transition';

    export let options = [];
    export let disabled = [];
    export let selectedOption;
    export let onChanged = () => {};
    let optionsOpen = false;

    const clickOption = (option) => {
        if (disabled.includes(option)) {
            return;
        }

        if (option != selectedOption) {
            onChanged(option, selectedOption);
        }
        selectedOption = option;
        optionsOpen = !optionsOpen;
    };
    
    onMount(() => {
        if (!selectedOption) {
            selectedOption = options[0];
        }
    });
</script>

<main>
    <div class="option selected" on:click={() => clickOption(selectedOption)}>
        {selectedOption}
        <Icon
            name="create_component_arrow"
            direction={optionsOpen ? 'n' : 's'}
        />
    </div>
    <section class="options">
        <div class="abs">
            {#each options as option, i}
                {#if option != selectedOption && optionsOpen}
                    <div
                        class="option"
                        class:disabled={disabled.includes(option)}
                        transition:slide|local={{ duration: 200 }}
                        on:click={() => clickOption(option)}
                    >
                        {option}
                    </div>
                {/if}
            {/each}
        </div>
    </section>
</main>

<style>
    main {
        position: relative;
        --dropdown-bg-color-fallback: var(--color-gray-900);
        --dropdown-bg-color-hover-fallback: var(--color-gray-800);
        --dropdown-border-color-fallback: var(--color-gray-500);
        --dropdown-width-fallback: 100%;
        width: var(--dropdown-width, var(--dropdown-width-fallback));
        z-index: 10;
        user-select: none;
    }

    div.option {
        padding: 6px;
        background-color: var(
            --dropdown-bg-color,
            var(--dropdown-bg-color-fallback)
        );
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    div.option.selected {
        border: 2px solid
            var(--dropdown-border-color, var(--dropdown-border-color-fallback));
        border-bottom: none;
    }
    
    div.option.disabled {
        opacity: 0.5;
    }
    
    section.options {
        position: relative;
    }

    section.options div.abs {
        position: absolute;
        top: 100%;
        left: 0;
        display: flex;
        flex-direction: column;
        width: var(--dropdown-width, var(--dropdown-width-fallback));
        background-color: var(
            --dropdown-bg-color,
            var(--dropdown-bg-color-fallback)
        );
        border: 2px solid
            var(--dropdown-border-color, var(--dropdown-border-color-fallback));
        border-top: none;
    }

    div.option:not(.selected):not(.disabled):hover {
        background-color: var(
            --dropdown-bg-color-hover,
            var(--dropdown-bg-color-hover-fallback)
        );
    }
</style>

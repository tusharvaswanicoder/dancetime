<script>
    import { createProject, createSelectedComponent } from '../../../stores';
    import { COMPONENT_TYPE } from '../../../constants';
    
    let component;
    $: {
        component = $createProject.components.find((component) => component.type == COMPONENT_TYPE.PREVIEW_AREA)
    }
    
    let startPercent = '0%';
    let endPercent = '0%';
    $: {
        if (component) {
            startPercent = `${
                (component.in / $createProject.duration) * 100
            }%`,
            endPercent = `${
                (component.out / $createProject.duration) * 100
            }%`;
        }
    }

    let selected = false;
    $: selected = $createSelectedComponent.type == COMPONENT_TYPE.PREVIEW_AREA;

</script>

{#if component}
    <main class:selected>
        <div class='section filled' style={`--start-percent: ${startPercent}; --end-percent: ${endPercent};`}></div>
        <div class='section start' style={`--left-percent: ${startPercent}`}></div>
        <div class='section end' style={`--left-percent: ${endPercent}`}></div>
    </main>
{/if}

<style>
    main:not(.selected) {
        opacity: 0.25;
    }

    main.selected {
        z-index: 1;
    }

    div.section {
        position: absolute;
        left: 0;
        height: 100%;
        width: var(--left-percent);
        transform: translateX(-1px);
        --color: var(--color-purple-light);
    }

    div.section.filled {
        left: var(--start-percent);
        width: calc(var(--end-percent) - var(--start-percent));
        background-color: var(--color-purple-dark);
        opacity: 0.25;
    }
    
    div.section.start {
        width: var(--left-percent);
        border-right: 2px solid var(--color);
    }
    
    div.section.end {
        left: var(--left-percent);
        width: calc(100% - var(--left-percent));
        border-left: 2px solid var(--color);
    }
</style>
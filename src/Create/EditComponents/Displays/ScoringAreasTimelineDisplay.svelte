<script>
    import { createProject, createSelectedComponent } from '../../../stores';
    import { COMPONENT_TYPE } from '../../../constants';
    import { GetScoringZoneEnabledNextKeyframe, GetScoringZoneEnabledPrevKeyframe } from '../../../utils';
    
    let component;
    $: {
        component = $createProject.components.find((component) => component.type == COMPONENT_TYPE.SCORING_AREAS)
    }
    
    const getTimestampPercentComplete = (time) => {
        const time_float = parseFloat(time);
        return time_float / $createProject.duration;
    }

    const shouldRenderKeyframeArea = (keyframe_time) => {
        return component.keyframes[keyframe_time] === false;
    }

    const getLeftOffset = (keyframe_time) => {
        return `${getTimestampPercentComplete(keyframe_time) * 100}%`;
    }

    const getRightOffset = (keyframe_time) => {
        let next_keyframe_time = GetScoringZoneEnabledNextKeyframe(keyframe_time, component.keyframes, true);
        const keyframe_end_time = next_keyframe_time || $createProject.duration;
        return `${getTimestampPercentComplete(keyframe_end_time) * 100}%`;
    }


    let selected = false;
    $: selected = $createSelectedComponent.type == COMPONENT_TYPE.SCORING_AREAS;

</script>

{#if component && component.keyframes}
    <main class:selected>
        {#each Object.keys(component.keyframes) as keyframe_time}
            {#if shouldRenderKeyframeArea(keyframe_time)}
                <div class='section filled' style={`--left-offset: ${getLeftOffset(keyframe_time)}; --right-offset: ${getRightOffset(keyframe_time)};`}></div>
                <div class='section start' style={`--left-offset: ${getLeftOffset(keyframe_time)}`}></div>
                <div class='section end' style={`--right-offset: ${getRightOffset(keyframe_time)}`}></div>
            {/if}
        {/each}
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
        left: var(--left-offset);
        height: 100%;
        transform: translateX(-1px);
        --color: var(--color-red-light);
    }

    div.section.filled {
        width: calc(var(--right-offset) - var(--left-offset));
        background-color: var(--color-red-dark);
        opacity: 0.25;
    }
    
    div.section.start {
        left: var(--left-offset);
        border-right: 2px solid var(--color);
    }
    
    div.section.end {
        left: var(--right-offset);
        border-left: 2px solid var(--color);
    }
</style>
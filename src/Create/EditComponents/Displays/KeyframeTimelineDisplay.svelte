<script>
    import { createProject } from '../../../stores';
    import Icon from '../../../Icon.svelte';
    export let keyframes = {};

    const getTimestampPercentComplete = (time) => {
        const time_float = parseFloat(time);
        return time_float / $createProject.duration;
    }

    const getKeyframeLeftOffset = (time) => {
        return `${getTimestampPercentComplete(time) * 100}%`;
    }
</script>

<main>
    <div class='line'></div>
    <div class='keyframes-container'>
        {#each Object.keys(keyframes) as keyframe_time}
            <div class='keyframe-container' style={`left: ${getKeyframeLeftOffset(keyframe_time)};`}>
                <Icon name={'keyframe'} />
            </div>
        {/each}
    </div>
</main>

<style>
    main {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        --color: var(--color-gray-500);
        z-index: 2;
    }

    div.line {
        position: absolute;
        top: 50%;
        width: 100%;
        height: 2px;
        transform: translateY(-50%);
        background-color: var(--color);
    }

    div.keyframes-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: grid;
        align-items: center;
    }

    div.keyframe-container {
        position: absolute;
        font-size: 1rem;
        color: var(--color);
        width: fit-content;
        height: fit-content;
        transform: translateX(-50%);
    }
</style>
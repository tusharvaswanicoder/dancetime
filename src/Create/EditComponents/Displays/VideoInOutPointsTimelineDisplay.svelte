<script>
    import { createSelectedComponent, createVideoDuration } from '../../../stores';
    
    let startPercent = '0%';
    let endPercent = '0%';
    $: {
        startPercent = `${
            ($createSelectedComponent.in / $createVideoDuration) * 100
        }%`,
        endPercent = `${
            ($createSelectedComponent.out / $createVideoDuration) * 100
        }%`;
    }

</script>

<div class='section start' style={`--left-percent: ${startPercent}`}><div class='bg'></div></div>
<div class='section end' style={`--left-percent: ${endPercent}`}><div class='bg'></div></div>

<style>
    div.section {
        position: absolute;
        left: 0;
        height: 100%;
        width: var(--left-percent);
        transform: translateX(-1px);
    }
    
    div.section.start {
        width: var(--left-percent);
        border-right: 2px solid var(--color-blue-dark);
    }
    
    div.section.end {
        left: var(--left-percent);
        width: calc(100% - var(--left-percent));
        border-left: 2px solid var(--color-blue-dark);
    }
    
    div.section div.bg {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: var(--color-gray-1000);
        opacity: 0.75;
        filter: blur(2px);
    }
    
    
</style>
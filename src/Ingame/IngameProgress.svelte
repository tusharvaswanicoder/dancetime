<script>
import { onDestroy, onMount } from 'svelte';
import { linear } from 'svelte/easing';
import { tweened } from 'svelte/motion';

    import ProgressCircle from '../ProgressCircle.svelte';
    import { playGameMetadata, ingameTime, ingameVideoPlayer } from '../stores';
    import { GetVideoStartAndEndTimeFromMetadata } from '../utils';
    
    const GetProgress = (ingameTimeValue) => {
        const startEndTime =
            GetVideoStartAndEndTimeFromMetadata($playGameMetadata);
            
        return Math.min(1, Math.max(0, (ingameTimeValue - startEndTime.start) / (startEndTime.end - startEndTime.start)));
    }

    const currentTime = tweened(0, {
        duration: 30,
        easing: linear
    })

    let raf;
    const onFrame = async () => {
        if ($ingameVideoPlayer) {
            const time = await $ingameVideoPlayer.getCurrentTime();
            currentTime.set(time);
        }

        raf = window.requestAnimationFrame(onFrame);
    }

    $: {
        $ingameTime = $currentTime;
    }

    onMount(() => {
        $ingameTime = 0;
        onFrame();
    })

    onDestroy(() => {
        if (raf) {
            raf = window.cancelAnimationFrame(raf);
        }
    })
    
    let progress = 0;
    $: {
        progress = GetProgress($ingameTime) * 100;
    }
    
</script>

<main>
    <div class="circle-container">
        <ProgressCircle value={progress}>
            <span>{Math.round(progress)}%</span> 
        </ProgressCircle>
    </div>
</main>

<style>
    main {
        height: 300px;
        width: 300px;
        padding: 10px;
        clip-path: polygon(
            0% 0%,
            100% 0%,
            0% 100%
        );
        background-image: linear-gradient(
            45deg,
            var(--color-pink-dark) 0%,
            var(--color-pink-light) 100%
        );
        box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
    }
    
    div.circle-container {
        width: 55%;
        height: 55%;
        --progress-trackcolor: rgba(255, 255, 255, 0.3);
        --progress-color: var(--color-gray-100);
        --progress-trackwidth: 8px;
        --progress-width: 7px;
    }

    div.circle-container span {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: fit-content;
        height: fit-content;
        margin: auto;
        font-weight: 900;
        font-size: 2.5rem;
        cursor: default;
        color: var(--color-gray-100);
    }

</style>
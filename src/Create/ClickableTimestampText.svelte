<script>
    import { createProject, createVideo, createAudio, createEditorDisabled } from '../stores';
    import { CreateNavToTime } from '../utils';
    
    const onClick = (e) => {
        const timestamp = e.target.text;
        if (!timestamp) {
            return;
        }
        
        const split = timestamp.split(':');
        const minutes = parseInt(split[0]);
        const seconds = parseInt(split[1]);
        const frames = parseInt(split[2]);
        
        const time = (minutes * 60) + seconds + (frames / $createProject.fps);
        CreateNavToTime(time, $createVideo, $createAudio, $createEditorDisabled);
    }
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a on:click={onClick}>
    <slot></slot>
</a>

<style>
    a {
        color: #4F85ED;
        cursor: pointer;
        text-decoration: underline;
    }
</style>
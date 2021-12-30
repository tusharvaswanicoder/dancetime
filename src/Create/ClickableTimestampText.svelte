<script>
    import { createVideoPlayer, createEditorDisabled } from '../stores';
    import { CreateNavToTime } from '../utils';
    
    const onClick = (e) => {
        const timestamp = e.target.text;
        if (!timestamp) {
            return;
        }
        
        const split = timestamp.split(':');
        const minutes = parseInt(split[0]);
        const seconds = parseFloat(split[1]);

        const time = (minutes * 60) + seconds;
        CreateNavToTime(time, $createVideoPlayer, $createEditorDisabled);
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
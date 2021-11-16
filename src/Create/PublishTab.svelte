<script>
    import { fly } from 'svelte/transition';
</script>

<main in:fly|local={{duration: 200, x: 200, delay: 200}} out:fly|local={{duration: 200, x: -200}}>
    Publish tab
</main>
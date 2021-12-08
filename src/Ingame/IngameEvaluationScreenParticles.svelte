<script>
    import { onMount } from 'svelte';
    import { tsParticles } from "tsparticles";

    let ParticlesComponent;
    let particlesConfig = {
        particles: {
            color: {
                value: '#000',
            },
            links: {
                enable: true,
                color: '#000',
            },
            move: {
                enable: true,
            },
        },
    };

    tsParticles
        .load('tsparticles', particlesConfig)
        .then((container) => {
            console.log("callback - tsparticles config loaded");
        })
        .catch((error) => {
            console.error(error);
        })
</script>

<svelte:component
    this={ParticlesComponent}
    id="tsparticles"
    options={particlesConfig}
/>

<!-- or -->

<!-- <svelte:component
    this={ParticlesComponent}
    id="tsparticles"
    url={particlesUrl}
    on:particlesLoaded={onParticlesLoaded}
    on:particlesInit={onParticlesInit}
/> -->

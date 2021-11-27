<script>
    export let player_data = {name: 'Unknown'};
</script>

<main>
    <h1>{player_data.name}</h1>
</main>

<style>
    main {
        --edge-pixels: 50px;
        width: 100%;
        clip-path: polygon(0% 0%, 100% 0%, calc(100% - var(--edge-pixels)) 100%, 0% 100%);
        background-image: linear-gradient(45deg, var(--color-pink-dark) 0%, var(--color-pink-light) 100%);
        box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
        padding: 16px;
        user-select: none;
    }
    
    h1 {
        font-size: 2rem;
        font-weight: 700;
        text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
        color: var(--color-gray-100);
        margin-left: 10px;
    }
</style>
<script>
    export let sections = [
        {title: 'Create', colors: ['var(--color-yellow-dark)', 'var(--color-yellow-light)']},
        {title: 'Play', colors: ['var(--color-pink-dark)', 'var(--color-pink-light)']}
    ]
    // export let sections = [
    //     {title: 'Party', colors: ['var(--color-purple-dark)', 'var(--color-purple-light)']},
    //     {title: 'Couple', colors: ['var(--color-turquoise-dark)', 'var(--color-turquoise-light)']},
    //     {title: 'Solo', colors: ['var(--color-red-dark)', 'var(--color-red-light)']}
    // ]
</script>

<main>
    {#each sections as section}
        <section style={`--bg-color1: ${section.colors[0]}; --bg-color2: ${section.colors[1]};`}>
            <div class='clip'>
                <div class='background'></div>
                <div class='text-wrapper'>
                    <div class='text'>{section.title}</div>
                </div>
            </div>
        </section>
    {/each}
</main>

<style>
    main {
        --diagonal-size: min(200px, 20vw);

        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-end;
        
        --shadow-color: 0deg 0% 0%;
        --shadow-opacity: 0.07;
    }

    main section {
        position: relative;
        filter: 
            drop-shadow(0.6px 0px 0.7px hsl(var(--shadow-color) / var(--shadow-opacity)))
            drop-shadow(1.8px 0.1px 2px hsl(var(--shadow-color) / var(--shadow-opacity)))
            drop-shadow(4.6px 0.2px 5.2px hsl(var(--shadow-color) / var(--shadow-opacity)))
            drop-shadow(11.2px 0.4px 12.6px hsl(var(--shadow-color) / var(--shadow-opacity)));
        flex: 1;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        place-content: center;
        cursor: pointer;
        user-select: none;
        transition: 0.2s ease-in-out all;
        pointer-events: none;
    }

    main section div.clip {
        position: relative;
        width: 100%;
        height: 100%;
        clip-path: polygon(
            0% 0%,
            calc(100% - var(--diagonal-size)) 0%,
            100% 100%,
            0% 100%
        );
        pointer-events: auto;
    }

    main section:not(:last-child):not(:first-child) {
        flex-grow: 1.4;
    }

    main section:hover
    {
        flex-grow: 1.7;
    }


    main section:not(:last-child):not(:first-child):hover {
        flex-grow: 1.9;
    }

    main section div.background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(
            45deg,
            var(--bg-color1) 0%,
            var(--bg-color2) 100%
        );
    }

    main section div.text-wrapper {
        position: absolute;
        width: calc(100% - var(--diagonal-size));
        height: 100%;
        display: grid;
        place-content: center;
    }

    main section:last-child div.text-wrapper, main section:first-child div.text-wrapper {
        width: calc(100% - var(--diagonal-size) / 2);
    }

    main section div.text {
        position: relative;
        font-size: 5rem;
        font-weight: 900;
        text-transform: uppercase;
        color: var(--color-gray-100);
        text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
    }

    main section:not(:last-child) {
        margin-left: calc(0% - var(--diagonal-size));
    }

    main section:not(:last-child) div.text-wrapper {
        margin-left: calc(var(--diagonal-size) / 2);
    }

    main section:first-child div.clip {
        clip-path: polygon(
            0% 0%,
            100% 0%,
            100% 100%,
            0% 100%
        );
    }
</style>
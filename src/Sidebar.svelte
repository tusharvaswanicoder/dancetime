<script>
    import Icon from './Icon.svelte';
    import { NAV_IDS } from './constants';
    import { SelectedNavIdStore } from "./stores"
    
    const click_nav = (nav_item) => 
    {
        SelectedNavIdStore.set(nav_item.nav_id);
    }

    const nav_items = [
        {
            icon_name: 'nav_play_icon',
            icon_stops: [
                { color: 'var(--color-pink-dark)', offset: '0' },
                { color: 'var(--color-pink-light)', offset: '1' },
            ],
            title: 'Play',
            class: 'play',
            nav_id: NAV_IDS.PLAY,
        },
        {
            icon_name: 'nav_create_icon',
            icon_stops: [
                { color: 'var(--color-yellow-dark)', offset: '0' },
                { color: 'var(--color-yellow-light)', offset: '1' },
            ],
            title: 'Create',
            class: 'create',
            nav_id: NAV_IDS.CREATE,
        },
        {
            icon_name: 'nav_downloads_icon',
            icon_stops: [
                { color: 'var(--color-blue-dark)', offset: '0' },
                { color: 'var(--color-blue-light)', offset: '1' },
            ],
            title: 'Downloads',
            class: 'downloads',
            nav_id: NAV_IDS.DOWNLOADS,
        },
    ];
</script>

<main>
    {#each nav_items as nav_item}
        <button
            class={`nav-item ${nav_item.class} ${
                nav_item.nav_id == $SelectedNavIdStore ? 'selected' : ''
            }`}
            on:click={() => click_nav(nav_item)}
        >
            <div class="background" />
            <div class="icon-container">
                <Icon name={nav_item.icon_name} stops={nav_item.icon_stops} />
            </div>
            <div class="title">{nav_item.title}</div>
        </button>
    {/each}
</main>

<style>
    main {
        background: var(--color-gray-100);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        grid-area: 'sidebar';
        z-index: 1;
        box-shadow: 4px 0px 8px 0px hsla(0, 0%, 0%, 0.25);
    }

    button.nav-item {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background-color: transparent;
        border: none;
    }

    button.nav-item.play {
        color: var(--color-pink-dark);
    }

    button.nav-item.create {
        color: var(--color-yellow-dark);
    }

    button.nav-item.downloads {
        color: var(--color-blue-dark);
    }

    button.nav-item.play div.title {
        margin-top: -1.25rem;
    }

    button.nav-item.create div.title {
        margin-top: -1rem;
    }

    button.nav-item.downloads div.title {
        margin-top: -2.25rem;
    }

    button.nav-item div.background {
        position: absolute;
        width: 12rem;
        height: 12rem;
        background-image: radial-gradient(
            circle at 50% 50%,
            currentColor 0%,
            transparent 70%
        );
        border-radius: 50%;
        opacity: 0.1;
        transform: scale(0);
        transition: 0.2s ease-in-out opacity, 0.2s ease-in-out transform;
    }

    button.nav-item.selected div.background {
        opacity: 0.25;
        transform: scale(1);
    }
    
    div.icon-container {
        font-size: 6rem;
        z-index: 1;
    }

    div.title {
        font-size: 1.25rem;
        user-select: none;
        z-index: 1;
        opacity: 0.75;
        transition: 0.1s ease-in-out transform, 0.1s ease-in-out opacity;
    }

    button.nav-item.selected div.title {
        /* font-size: 1.5rem; */
        transform: scale(1.2);
        opacity: 1;
    }
</style>

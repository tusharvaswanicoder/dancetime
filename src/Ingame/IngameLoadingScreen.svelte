<script>
    import { cubicOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import { onDestroy, onMount } from "svelte";
    import { GAMESTATE, LOCALSTORE_CAMERAPREF_NAME } from "../constants";
    import {
        settingsOpen,
        gameState,
        keyDown,
        playGameMetadata,
        playGameKeypoints,
        playGameCameraStream
    } from "../stores";
    import { HasCameraAccess, RequestCameraAccess } from "../utils";

    let preLoadbarTime = 2200;
    let loadbarTime = 3000;

    // IF all preflight checks have succeeded
    let canEnterGameplay = false;

    const onkeyDown = (e) => {
        if (e.key == "Escape" && !$settingsOpen) {
            // TODO: exit loading
            $gameState = GAMESTATE.NOT_INGAME;
        } else if (e.key == "Enter") {
            // Open Settings
            $settingsOpen = true;
        }
    };

    const PerformPlayChecks = async () => {
        // Check camera, setup TFJS, and check stores to make sure everything is in place

        // No camera access
        if (!(await HasCameraAccess())) {
            return;
        }

        // No chart metadata
        if (Object.keys($playGameMetadata).length == 0) {
            return;
        }
        
        // No chart keypoints
        if (Object.keys($playGameKeypoints).length == 0) {
            return;
        }
        
        const stream = await RequestCameraAccess(localStorage.getItem(LOCALSTORE_CAMERAPREF_NAME));
        if (!stream) {
            return;
        }

        $playGameCameraStream = stream;

        // Allow the ingame screen to load under this one now and start TFJS
        // Once TFJS is going and can see all 17 keypoints on the camera, allow entering gameplay
        
        canEnterGameplay = true;
    };

    const enterGameplay = () => {
        if (canEnterGameplay && initialDelayElapsed) {
            console.log("enter gameplay");
            // Enter gameplay woo
        }
    }

    let hasOpenedSettingsOnce = false;

    $: {
        $settingsOpen,
        hasOpenedSettingsOnce = $settingsOpen || hasOpenedSettingsOnce;
        if (hasOpenedSettingsOnce) {
            PerformPlayChecks();
        }
    }

    let initialDelayElapsed = false;

    $: {
        canEnterGameplay,
        enterGameplay()
    }

    onMount(() => {
        setTimeout(() => {
            PerformPlayChecks();
        }, preLoadbarTime);

        setTimeout(() => {
            initialDelayElapsed = true;
            enterGameplay();
        }, preLoadbarTime + loadbarTime);
    });

    onDestroy(() => {
        $playGameCameraStream = null;
        $playGameMetadata = {};
        $playGameKeypoints = {};
    })

    $: {
        onkeyDown($keyDown);
    }
</script>

<main transition:fade={{ duration: 400, easing: cubicOut }}>
    <div class="content">
        <h1 in:fly={{ delay: 600, duration: 1200, y: -50 }}>
            {$playGameMetadata.title || "Song Title"}
        </h1>
        <h2 in:fly={{ delay: 1200, duration: 1200, x: -50 }}>
            {$playGameMetadata.song_artist || "Song Artist"}
        </h2>
        <div
            class="loading-bar"
            style={`--loadbar-delay: ${preLoadbarTime}ms; --loadbar-duration: ${loadbarTime}ms;`}
        />
        <h3 in:fly={{ delay: 8000, duration: 1200, y: -50 }}>
            Press Enter to adjust settings.
        </h3>
    </div>
</main>

<style>
    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background-image: linear-gradient(
            45deg,
            var(--color-pink-dark) 0%,
            var(--color-pink-light) 100%
        );
        z-index: 15;
        display: grid;
        place-items: center;
        cursor: default;
        user-select: none;
        color: var(--color-gray-100);
    }

    div.content {
        display: flex;
        flex-direction: column;
        gap: 30px;
        width: fit-content;
        max-width: 50%;
        height: fit-content;
    }

    div.content > h1 {
        font-weight: 900;
        text-transform: uppercase;
        font-size: 5rem;
    }

    div.content > h2 {
        font-weight: 300;
        font-size: 1.75rem;
    }

    div.content > h3 {
        text-align: center;
    }

    div.content > div.loading-bar {
        height: 2px;
        background-color: var(--color-gray-100);
        border-radius: 10px;
        width: 0%;
        animation: var(--loadbar-duration, 3s) linear forwards loading-anim;
        animation-delay: var(--loadbar-delay, 2200ms);
    }

    @keyframes loading-anim {
        0% {
            width: 0%;
        }
        100% {
            width: 100%;
        }
    }
</style>

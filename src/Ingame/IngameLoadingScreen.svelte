<script>
    import { cubicOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import { onMount } from "svelte";
    import { GAMESTATE, LOCALSTORE_CAMERAPREF_NAME } from "../constants";
    import {
        settingsOpen,
        gameState,
        keyDown,
        playGameMetadata,
        playGameKeypoints,
        playGameCameraStream,
        ingameScreenShouldShow,
        ingameErrorMessage,
        ingameIsLoading,
        TFJSReady,
        ingameShouldScore,
        ingameVideoPlayer
    } from "../stores";
    import { HasCameraAccess, RequestCameraAccess, sleep, MirrorKeypoints } from "../utils";

    let preLoadbarTime = 2200;
    let loadbarTime = 3000;

    // IF all preflight checks have succeeded
    let canEnterGameplay = false;

    const onkeyDown = (e) => {
        if (e.key == "Enter") {
            // Open Settings
            $settingsOpen = true;
        }
    };

    let requestedChartKeypoints = false;
    let downloadingKeypoints = false;
    const PerformPlayChecks = async () => {
        // Check camera, setup TFJS, and check stores to make sure everything is in place
        $ingameErrorMessage = null;

        // No camera access
        if (!(await HasCameraAccess())) {
            $ingameErrorMessage = 'No camera detected.';
            return;
        }

        // No chart metadata
        if (Object.keys($playGameMetadata).length == 0) {
            $ingameErrorMessage = 'No chart metadata.';
            return;
        }

        if ($gameState != GAMESTATE.INGAME) {
            return;
        }
        
        // No keypoints, try to get them from server
        if (!$playGameKeypoints && $playGameMetadata.chart_id && !requestedChartKeypoints) {
            requestedChartKeypoints = true;
            // $ingameErrorMessage = 'Downloading keypoints...';
            
            downloadingKeypoints = true;
            let keypoints_result = await fetch(`/api/chart/${$playGameMetadata.chart_id}/keypoints`);
            keypoints_result = await keypoints_result.json();

            if (keypoints_result.keypoints) {
                $playGameKeypoints = keypoints_result.keypoints;
                $ingameErrorMessage = null;
                // TODO: cache these keypoints somewhere so if they play again they don't have to wait for download
            } else if (keypoints_result.error) {
                $ingameErrorMessage = keypoints_result.error;
                return;
            }

            downloadingKeypoints = false;
        }

        if (downloadingKeypoints) {
            return;
        }
        
        // No chart keypoints
        if (!$playGameKeypoints || Object.keys($playGameKeypoints).length == 0) {
            $ingameErrorMessage = 'No chart keypoints.';
            return;
        }

        // Mirror keypoints so we don't have to mirror the camera later
        const mirrored_keypoints = MirrorKeypoints($playGameKeypoints)
        $playGameKeypoints = mirrored_keypoints;

        // Unable to get camera access
        const stream = await RequestCameraAccess(localStorage.getItem(LOCALSTORE_CAMERAPREF_NAME));
        if (!stream) {
            $ingameErrorMessage = 'Unable access camera.';
            return;
        }

        $playGameCameraStream = stream;

        // Trigger ingame screen
        $ingameScreenShouldShow = true;

        // Allow the ingame screen to load under this one now and start TFJS
        // Once TFJS is going and can see all 17 keypoints on the camera, allow entering gameplay
        while (!$TFJSReady) {
            await sleep(100);
        }
        
        // Do not enter gameplay while settings are open
        while ($settingsOpen) {
            await sleep(500);
        }
        
        if ($gameState != GAMESTATE.INGAME) {
            return;
        }
        
        canEnterGameplay = true;
    };

    const enterGameplay = async () => {
        if (canEnterGameplay && initialDelayElapsed) {
            // Enter gameplay woo
            $ingameIsLoading = false;
            
            setTimeout(() => {
                $ingameVideoPlayer.playVideo();
                $ingameShouldScore = true;
            }, 2000);
        }
    }

    // When settings menu closes, perform checks again to see if we can enter gameplay
    let hasOpenedSettingsOnce = false;
    settingsOpen.subscribe((isOpen) => {
        hasOpenedSettingsOnce = isOpen || hasOpenedSettingsOnce;
        
        if (hasOpenedSettingsOnce && !isOpen) {
            PerformPlayChecks();
        }
    })

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
        <h3 in:fly={{ delay: 15000, duration: 1200, y: -50 }}>
            Press Enter to adjust settings.
        </h3>
    </div>
    {#if $ingameErrorMessage}
        <h2 in:fly={{ duration: 1200, y: 50 }} out:fade class='error-msg'>{$ingameErrorMessage}</h2>
    {/if}
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

    h2.error-msg {
        position: absolute;
        bottom: 15%;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
        font-weight: 300;
        font-style: italic;
        font-size: 1.75rem;
        width: fit-content;
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

<script>
    import Dropdown from './Dropdown.svelte';
    import Checkbox from './Checkbox.svelte';
    import RangeSlider from 'svelte-range-slider-pips';
    import Icon from './Icon.svelte';
    import { LOCALSTORE_CAMERAPREF_NAME } from './constants';
    import { GetAllVideoDevices, HasCameraAccess, RequestCameraAccess } from './utils';
    import { onMount } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';
    import { settingsOpen, keyDown } from './stores';

    const onkeyDown = (e) => {
        if (e.key == 'Escape') {
            $settingsOpen = false;
        }
    }

    $: {
        onkeyDown($keyDown);
    }

    export const ExitSettings = () => {
        $settingsOpen = false;
    }

    let cameraDevices = [];
    let selectedCameraId = localStorage.getItem(LOCALSTORE_CAMERAPREF_NAME);
    let selectedCamera;
    let cameraPreview;
    let cameraPreviewEnabled = false;

    let volumeSettings = {
        master: 0.5,
        music: 0.5,
        sfx: 0.5,
        announcer: 0.5
    }

    const onCameraOptionChanged = async (value, old_value) => {
        const device = (await GetAllVideoDevices()).find((e) => e.label == value);
        if (!device) { return; }
        localStorage.setItem(LOCALSTORE_CAMERAPREF_NAME, device.deviceId);
        selectedCameraId = device.deviceId;
        cameraPreview.srcObject = await RequestCameraAccess(selectedCameraId);
    }

    const toggleCameraPreview = async () => {
        cameraPreviewEnabled = !cameraPreviewEnabled;

        if (cameraPreviewEnabled && !cameraPreview.srcObject) {
            cameraPreview.srcObject = await RequestCameraAccess(selectedCameraId);
        }
    }

    const RefreshCameraDevices = async () => {
        const devices = await GetAllVideoDevices();
        cameraDevices = devices.map((c) => {return c.label});

        if (cameraDevices.length > 0 && !selectedCamera) {
            const localStoreCamId = localStorage.getItem(LOCALSTORE_CAMERAPREF_NAME);
            const selectedCam = devices.find((e) => e.deviceId == localStoreCamId);
            selectedCamera = selectedCam ? selectedCam.label : cameraDevices[0];
        }
    }

    const clickAllowCameraButton = async () => {
        await RequestCameraAccess();
        hasCameraAccess = await HasCameraAccess();
    }

    let hasCameraAccess = false;

    onMount(async () => {
        hasCameraAccess = await HasCameraAccess();
    })

    $: {
        hasCameraAccess,
        RefreshCameraDevices()
        if (selectedCameraId && hasCameraAccess) {
            RequestCameraAccess(selectedCameraId).then((stream) => {
                cameraPreview.srcObject = stream;
            })
        }
    }
</script>

<main transition:fade={{duration: 400, easing: cubicOut}}>
    <div class='content'>
        <h1>Settings</h1>
        <div class='grid-2-col'>
            <div class='settings'>
                <section class='camera'>
                    <h1>Camera</h1>
                    <div class='grid-2-col'>
                        {#if hasCameraAccess}
                            <h1>Show Camera During Gameplay</h1>
                            <Checkbox />
                            <h2>Selected Camera</h2>
                            <Dropdown options={cameraDevices} selectedOption={selectedCamera} onChanged={onCameraOptionChanged} />
                        {:else}
                            <button on:click={clickAllowCameraButton}>Allow Camera Access</button>
                        {/if}
                    </div>
                </section>
                <section>
                    <h1>Audio</h1>
                    <div class='grid-2-col'>
                        <h1>Master Volume</h1>
                        <RangeSlider
                            bind:values={volumeSettings.master}
                            springValues={{ stiffness: 1, damping: 1 }}
                            min={0}
                            max={1}
                            step={0.01}
                            float
                        />
                        <h1>Music Volume</h1>
                        <RangeSlider
                            bind:values={volumeSettings.music}
                            springValues={{ stiffness: 1, damping: 1 }}
                            min={0}
                            max={1}
                            step={0.01}
                            float
                        />
                        <h1>Sound Effects Volume</h1>
                        <RangeSlider
                            bind:values={volumeSettings.sfx}
                            springValues={{ stiffness: 1, damping: 1 }}
                            min={0}
                            max={1}
                            step={0.01}
                            float
                        />
                        <h1>Announcer Volume</h1>
                        <RangeSlider
                            bind:values={volumeSettings.announcer}
                            springValues={{ stiffness: 1, damping: 1 }}
                            min={0}
                            max={1}
                            step={0.01}
                            float
                        />
                    </div>
                </section>
                <section>
                    <h1>Keyboard Shortcuts</h1>
                </section>
            </div>
            {#if hasCameraAccess}
                <div class='camera-preview-container'>
                    <div class='camera-preview' on:click={toggleCameraPreview}>
                        {#if !cameraPreviewEnabled}
                            <h3>Click to toggle camera preview.</h3>
                        {/if}
                        <!-- svelte-ignore a11y-media-has-caption -->
                        <video class:enabled={cameraPreviewEnabled} autoplay muted bind:this={cameraPreview} />
                    </div>
                    <h2>Make sure that the camera can see your entire body.</h2>
                </div>
            {/if}
        </div>
    </div>
    
    <div class="close-container" on:click={ExitSettings}>
        <Icon name="x_icon" />
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
        background-image: linear-gradient(45deg, var(--color-blue-dark) 0%, var(--color-blue-light) 100%);
        z-index: 15;
        display: grid;
        place-items: flex-start center;
        cursor: default;
        color: var(--color-gray-100);
    }

    div.content {
        display: flex;
        flex-direction: column;
        gap: 60px;
        width: 60%;
        height: fit-content;
        margin-top: 40px;
        margin-bottom: 40px;
    }

    div.content > h1 {
        font-weight: 900;
        text-transform: uppercase;
        font-size: 5rem;
    }

    section > h1 {
        font-size: 1.5rem;
        position: sticky;
    }

    section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        --dropdown-bg-color: transparent;
        --dropdown-border-color: var(--color-gray-100);
        --dropdown-bg-color-hover: hsl(0deg, 0%, 100%, 0.2);
    }

    div.grid-2-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: 80px;
    }

    section div.grid-2-col {
        grid-template-columns: minmax(max-content, 1fr) 1fr;
        gap: 10px;
    }
    
    div.settings {
        display: flex;
        flex-direction: column;
        gap: 60px;
    }

    div.camera-preview-container {
        align-self: flex-start;
    }

    div.camera-preview-container h2 {
        text-align: center;
        color: var(--color-gray-100);
        margin-top: 10px;
    }

    div.camera-preview {
        aspect-ratio: 16 / 9;
        width: 100%;
        background-color: var(--color-gray-300);
        border-radius: 20px;
        display: grid;
        place-items: center;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    div.camera-preview h3 {
        font-style: italic;
        user-select: none;
        padding: 10px;
        text-align: center;
    }

    div.camera-preview video {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        top: 0;
        margin: auto;
        height: 100%;
        width: auto;
        display: none;
    }

    div.camera-preview video.enabled {
        display: initial;
    }

    section.camera {
        padding-bottom: 90px;
    }
    
    div.close-container {
        position: fixed;
        top: 0;
        right: 0;
        color: var(--color-gray-200);
        margin: 10px;
        font-size: 1.25rem;
        cursor: pointer;
        z-index: 10;
    }
    
    div.close-container:hover {
        color: white;
    }

    /* Hide scrollbar for Chrome, Safari and Opera */
    * ::-webkit-scrollbar {
        display: none;
    }

    * {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
</style>
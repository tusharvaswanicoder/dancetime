<script>
    import Icon from '../Icon.svelte';
    import VideoPreview from './VideoPreview.svelte';
    import {
        createProject,
        createEditorDisabled,
        createVideoPlayer,
        createLoadingFinished,
        keyPress,
        keyDown,
        message
    } from '../stores';
    import VideoPreviewSeeker from './VideoPreviewSeeker.svelte';
    import {
        CreateNavToBeginning,
        CreateNavToEnd,
        CreateNavToNextFrame,
        CreateNavToPrevFrame,
        CreatePlayOrPause,
    } from '../utils';

    const isLoadingFinished = () => {
        return $createLoadingFinished;
    };

    const updatePausePlayIcons = async () => {
        const playerState = await $createVideoPlayer.getPlayerState();
        const paused = playerState == 2 || playerState == 0;
        icons['video_play_icon'].display = paused;
        icons['video_pause_icon'].display = !paused;
    };

    const onVideoPaused = () => {
        updatePausePlayIcons();
    };

    const onVideoPlayed = () => {
        updatePausePlayIcons();
    };

    const icons = {
        ['video_beginning_icon']: {
            tooltip: 'Skip to Beginning (Left Bracket)',
            display: true,
            func: CreateNavToBeginning,
        },
        ['video_prev_frame_icon']: {
            tooltip: 'Previous Frame (Left Arrow)',
            display: true,
            func: CreateNavToPrevFrame,
        },
        ['video_play_icon']: {
            tooltip: 'Play (Space)',
            display: true,
            func: CreatePlayOrPause,
        },
        ['video_pause_icon']: {
            tooltip: 'Pause (Space)',
            display: false,
            func: CreatePlayOrPause,
        },
        ['video_next_frame_icon']: {
            tooltip: 'Next Frame (Right Arrow)',
            display: true,
            func: CreateNavToNextFrame,
        },
        ['video_end_icon']: {
            tooltip: 'Skip to End (Right Bracket)',
            display: true,
            func: CreateNavToEnd,
        },
    };

    const ClickNavIcon = (icon_name) => {
        const icon = icons[icon_name];
        if (icon) {
            icon.func($createVideoPlayer, $createEditorDisabled);
            updatePausePlayIcons();
        }
    };

    const onKeyPress = (e) => {
        if (!isLoadingFinished()) {
            return;
        }

        if (e.key == ' ') {
            CreatePlayOrPause($createVideoPlayer, $createEditorDisabled);
        }
        updatePausePlayIcons();
    };

    const onKeyDown = (e) => {
        if (!isLoadingFinished()) {
            return;
        }

        if (e.key == 'ArrowLeft') {
            CreateNavToPrevFrame($createVideoPlayer, $createEditorDisabled);
        } else if (e.key == 'ArrowRight') {
            CreateNavToNextFrame($createVideoPlayer, $createEditorDisabled);
        } else if (e.key == '[') {
            CreateNavToBeginning($createVideoPlayer, $createEditorDisabled);
        } else if (e.key == ']') {
            CreateNavToEnd($createVideoPlayer, $createEditorDisabled);
        }
        updatePausePlayIcons();
    };

    $: {
        onKeyPress($keyPress);
    }

    $: {
        onKeyDown($keyDown);
    }

    const onYoutubeEvent = (data) => {
        if (data.event == "infoDelivery") {
            // TODO: tween this
            updatePausePlayIcons();
        }
    }

    const onMessage = (evt) => {
        if (evt.origin == "https://www.youtube.com" && evt.isTrusted) {
            onYoutubeEvent(JSON.parse(evt.data));
        }
    }

    $: {
        onMessage($message)
    }
</script>

{#if $createProject}
    <main>
        <div class="title">{$createProject.project_name}</div>
        <VideoPreview {onVideoPaused} {onVideoPlayed} />
        <div class="nav-and-seek">
            <VideoPreviewSeeker />
            <div class="video-nav">
                <div class="nav-icons">
                    {#each Object.entries(icons) as [icon_name, entry]}
                        {#if entry.display}
                            <div class="icon-container" title={entry.tooltip}>
                                <Icon name={icon_name} OnClick={ClickNavIcon} />
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </main>
    {#if $createEditorDisabled}
        <div class="disable-overlay" />
    {/if}
{/if}

<style>
    main {
        position: relative;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: min-content min-content 1fr;
        padding: 6px;
        padding-left: 40px;
        padding-right: 40px;
        text-align: center;
        height: 100%;
    }

    div.disable-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.4;
        background: repeating-linear-gradient(
            -45deg,
            var(--color-blue-dark),
            var(--color-blue-dark) 5px,
            black 5px,
            black 25px
        );
        animation: disable-anim 1s linear infinite;
        animation-delay: 0.15s;
        cursor: wait;
    }

    @keyframes disable-anim {
        0% {
            transform: scale(1.5) translateX(-35px);
        }
        100% {
            transform: scale(1.5) translateX(0%);
        }
    }

    main div.title {
        color: var(--color-gray-300);
        font-size: 22px;
        cursor: default;
        margin-bottom: 8px;
    }

    main div.video-nav {
        font-size: 2rem;
        color: var(--color-gray-100);
    }

    div.nav-icons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin: 10px;
    }

    div.nav-icons div.icon-container {
        cursor: pointer;
    }

    div.nav-icons div.icon-container:active {
        transform: scale(1.1);
    }

    div.nav-and-seek {
        align-self: center;
    }
</style>

<script>
    import BackArrow from "../BackArrow.svelte";
    import SongPreviewSection from "./SongPreviewSection.svelte";
    import SongSelectWheel from "./SongSelectWheel.svelte";
    import {
        selectedInitialGamemode,
        modeStateStore,
        groupmodeStateStore,
        songWheelSelectedCategory,
        songWheelChartMetadata,
        songWheelCategoryCurrentIndex
    } from "../stores";
    import { GROUP_MODES, SONG_WHEEL_CATEGORIES, SONG_WHEEL_CATEGORY_INFO } from "../constants";

    const onClickBackArrow = () => {
        $selectedInitialGamemode = false;
        $modeStateStore = null;
        $groupmodeStateStore = null;
    };

    let currentGroupMode;
    $: currentGroupMode = GROUP_MODES.find(
        (v) => v.state == $groupmodeStateStore
    );
    
    // Every time the song category changes, the charts are fetched from the server
    const refreshSongCategoryCharts = (category_id) => {
        if (typeof category_id == 'undefined') {
            return;
        }

        if ($songWheelChartMetadata[category_id] && $songWheelChartMetadata[category_id].length > 0) {
            return;
        }

        const category_name = SONG_WHEEL_CATEGORY_INFO[category_id].title;

        fetch(`/api/charts/category/${category_name}`)
            .then((res) => res.json())
            .then((res) => {
                $songWheelChartMetadata[category_id] = res.charts;
                $songWheelCategoryCurrentIndex[category_id] = 0;
                $songWheelCategoryCurrentIndex = $songWheelCategoryCurrentIndex;

                for (const category_id of Object.values(SONG_WHEEL_CATEGORIES)) {
                    if (!$songWheelChartMetadata[category_id]) {
                        $songWheelChartMetadata[category_id] = [];
                    }
                }
                $songWheelChartMetadata = $songWheelChartMetadata;
            })
            .catch((error) => {
                console.log(error);
            });
    };

    $: refreshSongCategoryCharts($songWheelSelectedCategory);
</script>

<main>
    <div class="top-bar">
        {#if currentGroupMode}
            <BackArrow
                onClick={onClickBackArrow}
                style={"position: relative; margin: 0; width: fit-content;"}
                color={"var(--color-gray-200)"}
                hoverColor={"var(--color-gray-300)"}
            />
            <h1
                style={`--text-color1: ${currentGroupMode.colors[0]}; --text-color2: ${currentGroupMode.colors[1]};`}
            >
                {currentGroupMode.title}
            </h1>
            <div />
        {/if}
    </div>
    <div class="middle-section">
        <SongPreviewSection />
    </div>
    <div class="song-select-wheel">
        <SongSelectWheel />
        <h3>Press Enter to Play</h3>
    </div>
</main>

<style>
    main {
        position: relative;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-rows: 10% 1fr max-content;
    }

    main div.top-bar {
        position: relative;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        justify-items: stretch;
        align-items: center;
        margin-top: 10px;
        padding-left: 20px;
        padding-right: 20px;
        gap: 20px;
    }

    main div.top-bar h1 {
        font-size: 5rem;
        font-weight: 900;
        text-transform: uppercase;
        text-align: center;
        background: linear-gradient(
            45deg,
            var(--text-color1) 0%,
            var(--text-color2) 100%
        );
        background-clip: text;
        -webkit-text-fill-color: transparent;
        cursor: default;
    }

    /* main > * {
        border: 2px dashed red;
    } */

    div.song-select-wheel {
        position: relative;
        width: 100%;
        overflow: hidden;
    }

    div.song-select-wheel h3 {
        color: var(--color-gray-300);
        text-transform: uppercase;
        text-align: center;
        font-size: 1rem;
        letter-spacing: 0.25rem;
        margin: 10px;
        cursor: default;
    }
</style>

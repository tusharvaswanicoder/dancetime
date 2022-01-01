<script>
    import { onMount, onDestroy } from 'svelte';
    import { songWheelSelectedCategory, songWheelChartMetadata, songWheelCategoryCurrentIndex } from '../stores';
    import { getCategoryColorVars, GetVideoPreviewTimesFromMetadata } from '../utils';
    import Icon from '../Icon.svelte';
    import YouTubePlayer from 'youtube-player';

    let upvotes_width = 0;
    let upvotes_height = 0;
    let difficulty_width = 0;
    let difficulty_height = 0;

    const video_div_id = 'preview-youtube-video';
    let previewVideoPlayer;
    let selectedSongMetadata;

    const refreshSelectedSongMetadata = () => {
        const category = $songWheelSelectedCategory;
        if (typeof category == 'undefined' || !$songWheelChartMetadata[category] ||
            typeof $songWheelCategoryCurrentIndex[category] == 'undefined') {
            return;
        }

        const metadata = $songWheelChartMetadata[category][$songWheelCategoryCurrentIndex[category]];
        if (!metadata) {
            return;
        }

        selectedSongMetadata = metadata;
    }

    let last_refresh_time = new Date().getTime();
    const refreshYoutubeEmbed = () => {
        if (!selectedSongMetadata) {
            return;
        }

        // Only allow refreshing once a second max
        const current_time = new Date().getTime();
        if (current_time - last_refresh_time < 1000) {
            return;
        }
        last_refresh_time = new Date().getTime();

        if (!previewVideoPlayer) {
            return;
        }

        if (!document.getElementById(video_div_id)) {
            return;
        }

        const previewTime = GetVideoPreviewTimesFromMetadata(selectedSongMetadata);
        previewVideoPlayer.loadVideoById({
            videoId: selectedSongMetadata.video_id,
            startSeconds: previewTime.start,
            endSeconds: previewTime.end
        })
    }

    $: {
        $songWheelSelectedCategory,
        $songWheelChartMetadata,
        $songWheelCategoryCurrentIndex,
        refreshSelectedSongMetadata();
    }
    
    $: {
        selectedSongMetadata,
        refreshYoutubeEmbed();
    }

    let raf;
    const onFrame = async () => {
        raf = window.requestAnimationFrame(onFrame);

        // Restart the preview area of the video if it finished playing
        if (previewVideoPlayer && previewVideoPlayer.getCurrentTime && selectedSongMetadata) {
            const previewTime = GetVideoPreviewTimesFromMetadata(selectedSongMetadata);
            const currentTime = await previewVideoPlayer.getCurrentTime();

            if (currentTime >= previewTime.end) {
                previewVideoPlayer.seekTo(previewTime.start);
            }
        }
    }

    let youtubeEmbedCheckInterval;
    onMount(() => {
        onFrame();

        previewVideoPlayer = YouTubePlayer(video_div_id, {
            playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                modestbranding: 1,
                origin: document.domain,
                rel: 0,
                showinfo: 0,
                frameborder: 0,
                iv_load_policy: 3,
                volume: 3
            }
        });
        previewVideoPlayer.setVolume(3);

        // Refresh the youtube player if it failed to load
        youtubeEmbedCheckInterval = setInterval(async () => {
            if (previewVideoPlayer && selectedSongMetadata) {
                const timeout = setTimeout(() => {
                    refreshYoutubeEmbed();
                }, 400);

                if (previewVideoPlayer && previewVideoPlayer.getCurrentTime) {
                    await previewVideoPlayer.getCurrentTime();
                    clearTimeout(timeout);

                    // Wrong video embedded
                    const video_url = await previewVideoPlayer.getVideoUrl();
                    if (video_url && !video_url.includes(selectedSongMetadata.video_id)) {
                        refreshYoutubeEmbed();
                    }
                }
            } else {
                refreshYoutubeEmbed();
            }
        }, 500);
    })

    onDestroy(() => {
        if (previewVideoPlayer) {
            previewVideoPlayer.destroy();
        }
        if (raf) {
            window.cancelAnimationFrame(raf);
        }
        if (youtubeEmbedCheckInterval) {
            youtubeEmbedCheckInterval = clearInterval(youtubeEmbedCheckInterval);
        }
    })

</script>

<main>
    <section></section>
    <section>
        <div class='visual-preview' style={getCategoryColorVars($songWheelSelectedCategory)}>
            <div class='inner-content' id={video_div_id} />
            <div class='content-block-container' />
            <div class='clipped upvotes' style={`--text-height: ${upvotes_height}px; --text-width: ${upvotes_width}px;`}>
                <h3 bind:clientWidth={upvotes_width} bind:clientHeight={upvotes_height}>
                    <Icon name={'create_publish_arrow'} direction={'n'} style={'display: inline; font-size: 1rem;'} />
                    43
                </h3>
            </div>
            {#if selectedSongMetadata}
                <div class='clipped difficulty' style={`--text-height: ${difficulty_height}px; --text-width: ${difficulty_width}px;`}>
                    <h3 bind:clientWidth={difficulty_width} bind:clientHeight={difficulty_height}>{selectedSongMetadata.difficulty}</h3>
                </div>
            {/if}
        </div>
        <div class='play-button'>Play<Icon name={'video_play_icon'} /></div>
    </section>
    <section>
        {#if selectedSongMetadata}
            <div class='details song-title'>{selectedSongMetadata.title}</div>
            <div class='details song-artist'>{selectedSongMetadata.song_artist}</div>
            <div class='view-details'>View Details<Icon name={'create_publish_arrow'} style={'font-size: 0.75rem;'} direction={'e'} /></div>
        {/if}
    </section>
</main>

<style>
    main {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
        padding-top: 20px;
    }

    /* main section:nth-of-type(1) {
        border: 2px solid red;
    } */

    main section:nth-of-type(2) {
        /* border: 2px solid orange; */
        display: grid;
        grid-template-rows: 75% 1fr;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    /* main section:nth-of-type(3) {
        border: 2px solid yellow;
    } */

    div.visual-preview {
        position: relative;
        height: 100%;
        /* width: 100%; */
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 16px;
        overflow: hidden;
        border: 8px solid transparent;
        background: linear-gradient(45deg, var(--color1), var(--color2)) border-box;
        align-self: flex-start;
    }

    div.visual-preview div.clipped {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: inherit;
        user-select: none;
    }

    div.visual-preview div.upvotes {
        --top: 0%;
        --right: calc(100% - var(--text-width) - 4px);
        --bottom: calc(100% - var(--text-height) - 4px);
        --left: 0%;
        clip-path: inset(var(--top) var(--right) var(--bottom) var(--left) round 0 0 8px 0);
    }

    div.visual-preview div.difficulty {
        --top: 0%;
        --right: -1px;
        --bottom: calc(100% - var(--text-height) - 4px);
        --left: calc(100% - var(--text-width) - 4px);
        clip-path: inset(var(--top) var(--right) var(--bottom) var(--left) round 0 0 0 8px);
    }

    div.visual-preview div.clipped h3 {
        position: absolute;
        top: 0;
        color: white;
        font-weight: bold;
        font-size: 1.25rem;
        width: fit-content;
        padding-left: 4px;
        padding-right: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
    }

    div.visual-preview div.clipped.difficulty h3 {
        right: 0;
    }

    div.visual-preview .inner-content {
        height: 100%;
        width: 100%;
        object-fit: cover;
        border-radius: 12px;
        background-color: black;
    }

    div.play-button {
        --edge-pixels: 50px;
        clip-path: polygon(
            var(--edge-pixels) 0%,
            100% 0%,
            calc(100% - var(--edge-pixels)) 100%,
            0% 100%
        );
        background-image: linear-gradient(45deg, var(--color-pink-dark) 0%, var(--color-pink-light) 100%);
        width: fit-content;
        padding: 20px;
        min-width: 50%;
        width: 300px;
        max-width: 100%;
        color: white;
        font-weight: 900;
        text-transform: uppercase;
        font-size: 2.25rem;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 8px;
        justify-self: center;
        user-select: none;
        cursor: pointer;
        transition: 0.1s ease-in-out transform;
    }

    div.play-button:hover {
        transform: scale(1.05);
    }

    div.play-button:active {
        transform: scale(0.9);
    }

    div.details {
        font-size: 1.25rem;
        margin-bottom: 4px;
    }

    div.details.song-title {
        font-weight: bold;
    }

    div.view-details {
        margin-top: 20px;
        color: #4F85ED;
        font-size: 1rem;
        cursor: pointer;
        text-transform: uppercase;
        display: flex;
        flex-direction: row;
        gap: 6px;
        justify-content: center;
        align-items: center;
        width: fit-content;
    }

    div.view-details:hover {
        text-decoration: underline;
    }

    div.content-block-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

</style>
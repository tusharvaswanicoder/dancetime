<script>
    import ProgressCircle from '../ProgressCircle.svelte';
    import Icon from '../Icon.svelte';
    import { dlManager, MEDIA_STATUS } from './DownloadManager';
    import { tweened } from 'svelte/motion';
    import { quadOut } from 'svelte/easing';
    import { GetVideoBlobFromDB } from './VideoBlobManager';

    export let songData = {};

    const ConvertDurationToNiceString = (duration) => {
        return `${Math.floor(duration / 60)}:${(duration % 60)
            .toString()
            .padStart(2, '0')}`;
    };

    const GetTotalMB = () => {
        return (
            (songData['filesize-v'] + songData['filesize-a']) /
            (1024 * 1024)
        ).toFixed(0);
    };

    const GetFormattedDate = (_date) => {
        const date = new Date(_date);
        return `${date.toLocaleString('default', {
            month: 'short',
        })} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const GetDownloadCircleCompletion = () => {
        return dlManager.getMediaPercentComplete(songData.media_id);
    };

    const GetDownloadCircleColor = () => {
        if (
            songData.status == MEDIA_STATUS.ERROR ||
            songData.status == MEDIA_STATUS.UNAVAILABLE
        ) {
            return [
                { color: 'var(--color-red-dark)', offset: '0' },
                { color: 'var(--color-red-light)', offset: '1' },
            ];
        } else if (songData.status == MEDIA_STATUS.NOT_READY) {
            return [
                { color: 'var(--color-yellow-dark)', offset: '0' },
                { color: 'var(--color-yellow-light)', offset: '1' },
            ];
        } else if (songData.status != MEDIA_STATUS.FINISHED) {
            return [
                { color: 'var(--color-blue-dark)', offset: '0' },
                { color: 'var(--color-blue-light)', offset: '1' },
            ];
        } 

        return [
            { color: 'var(--color-green-dark)', offset: '0' },
            { color: 'var(--color-green-light)', offset: '1' },
        ];
    };

    const GetDownloadCircleText = () => {
        if (songData.status == MEDIA_STATUS.ERROR) {
            return 'Error';
        } else if (songData.status == MEDIA_STATUS.FINISHED) {
            return `${GetTotalMB()} MB`;
        } else if (songData.status == MEDIA_STATUS.NOT_READY) {
            return `Wait...`;
        } else {
            return `${GetDownloadCircleCompletion().toFixed(0)}%`;
        }
    };

    const GetThumbnailBlobUrl = () => {
        if (songData['indexedMediaBlob-t']) {
            GetVideoBlobFromDB(songData['indexedMediaBlob-t'], (blob) => {
                thumbnailBlobUrl = URL.createObjectURL(blob);
            });
        }
    };
    
    const OnClickDelete = (e) => {
        dlManager.deleteMetadataStoreEntry(songData);
    };

    const OnClickRetry = (e) => {
        dlManager.startMediaDownload(songData.media_id);
    };

    let stops = GetDownloadCircleColor();
    let downloadCircleCompletion = tweened(GetDownloadCircleCompletion(), {
        duration: 200,
        easing: quadOut,
    });
    let downloadCircleText = GetDownloadCircleText();
    let thumbnailBlobUrl;
    GetThumbnailBlobUrl();

    $: {
        songData,
            (stops = GetDownloadCircleColor()),
            downloadCircleCompletion.set(GetDownloadCircleCompletion()),
            (downloadCircleText = GetDownloadCircleText()),
            GetThumbnailBlobUrl()
    }
</script>

<main>
    <a
        href={songData.url ||
            `https://www.youtube.com/watch?v=${songData.media_id}`}
        target="_blank"
    >
        <div class="image-container">
            {#if thumbnailBlobUrl}
                <img alt="Video thumbnail" src={thumbnailBlobUrl} />
            {/if}
            <div class="duration">
                {songData.duration
                    ? ConvertDurationToNiceString(songData.duration)
                    : '0:00'}
            </div>
        </div>
    </a>
    <div class="text-container">
        <header>
            <h1>
                {songData.status == MEDIA_STATUS.STARTING
                    ? 'Starting Download...'
                    : songData.title || 'Unknown Video'}
            </h1>
            <h2>
                {songData.status == MEDIA_STATUS.STARTING
                    ? ''
                    : songData.channel || 'Unknown'}
            </h2>
        </header>
        <footer>
            <h2>Downloaded: {GetFormattedDate(songData.download_date)}</h2>
            <h2>Last Played: {songData.last_played || 'Never'}</h2>
        </footer>
    </div>
    <div class="right-container">
        <div class="circle-container">
            <ProgressCircle {stops} value={$downloadCircleCompletion}
                ><span>{downloadCircleText}</span></ProgressCircle
            >
        </div>
        <div class="icons-container">
            {#if songData.status != MEDIA_STATUS.FINISHED}
                <div
                    class="icon-container retry"
                    on:click={() => OnClickRetry()}
                >
                    <Icon name="retry_icon" />
                </div>
            {/if}
            <div class="icon-container delete" on:click={() => OnClickDelete()}>
                <Icon name="trash_icon" />
            </div>
        </div>
    </div>
</main>

<style>
    main {
        background-color: var(--color-gray-100);
        padding: 20px;
        border-radius: 10px;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.25);
        display: grid;
        grid-template-columns: min-content 1fr min-content;
        gap: 26px;
        margin-bottom: 30px;
    }

    div.image-container {
        height: 180px;
        width: 320px;
        border-radius: 14px;
        background-color: var(--color-gray-300);
        position: relative;
    }

    div.image-container img {
        width: 100%;
        height: 100%;
        border-radius: 14px;
    }

    div.duration {
        position: absolute;
        background-color: var(--color-gray-900);
        color: white;
        font-weight: 700;
        padding: 6px;
        padding-left: 8px;
        padding-right: 8px;
        border-radius: 6px;
        font-size: 14px;
        cursor: default;
        bottom: -8px;
        right: -8px;
    }

    h1 {
        font-size: 26px;
    }

    h2 {
        margin-top: 6px;
        font-size: 18px;
        color: var(--color-gray-700);
    }

    div.text-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: default;
    }

    footer {
        color: var(--color-gray-500);
    }

    div.right-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-between;
    }

    div.circle-container {
        width: 120px;
        height: 120px;
        --progress-trackcolor: var(--color-gray-200);
        --progress-color: var(--color-blue-dark);
    }

    div.circle-container span {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: fit-content;
        height: fit-content;
        margin: auto;
        font-weight: 700;
        font-size: 20px;
        cursor: default;
    }

    div.icon-container {
        color: var(--color-gray-300);
        font-size: 2rem;
        cursor: pointer;
    }

    div.icon-container:hover {
        color: var(--color-gray-500);
    }

    div.icons-container {
        display: flex;
        flex-direction: row;
        gap: 12px;
    }
</style>

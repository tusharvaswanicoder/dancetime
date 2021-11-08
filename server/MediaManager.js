const { v1: uuidv1 } = require('uuid');
const { azBlobManager, CONTAINER_TYPE } = require('./AzBlobManager');
const { YTDL } = require('./YouTubeDL');
const path = require('path');
const fs = require('fs');
const https = require('https')

const DOWNLOAD_DIR = './downloads/';
const {IS_PYTHON_INSTALLED} = require('./PythonManager');
const MEDIA_SITES = ['youtube']

const MEDIA_STATUS = {
    NOT_STARTED: 1,
    UNAVAILABLE: 2,
    RETRIEVING_METADATA: 3,
    CONVERTING: 4,
    ERROR: 5,
    COMPLETED: 6,
    NOT_READY: 7
};

const MEDIA_TYPE = {
    VIDEO: 'v',
    AUDIO: 'a',
    THUMBNAIL: 't'
};

// Minimum retention time of an entry in this.in_progress_media - longer if it is accessed frequently
const MEMORY_RETENTION_TIME = 1000 * 60 * 15;

const MAX_MEDIA_DURATION = 60 * 10; // 10 minutes max for videos

// TODO: use uuids instead of youtube ids for filenames so they cannot be searched for.
// Will require a separate lookup table though with more transactions

class MediaManager {
    constructor() {
        // Current media that is downloading and not yet in the blob store
        this.in_progress_media = {};
        this.videoid_cache_lookup = {};
        this.metadata_cache = {};

        if (!fs.existsSync(DOWNLOAD_DIR)) {
            fs.mkdirSync(DOWNLOAD_DIR);
        }
        
        this.deleteInProgressMediaInterval();

        // Cleanup old downloaded media
        this.cleanupOldDownloadedMedia();
    }

    getNewInProgressMedia(metadata) {
        return {
            status: MEDIA_STATUS.NOT_STARTED,
            media_id: metadata.id,
            ...this.getMetadataToSend(metadata)
        };
    }

    getCompletedMedia(metadata) {
        return {
            status: MEDIA_STATUS.COMPLETED,
            media_id: metadata.id,
            video_url: azBlobManager.get_download_url(
                CONTAINER_TYPE.VIDEO,
                this.getMediaFilename(metadata.id, MEDIA_TYPE.VIDEO)
            ),
            audio_url: azBlobManager.get_download_url(
                CONTAINER_TYPE.AUDIO,
                this.getMediaFilename(metadata.id, MEDIA_TYPE.AUDIO)
            ),
            thumbnail: azBlobManager.get_download_url(
                CONTAINER_TYPE.THUMBNAILS,
                this.getMediaFilename(metadata.id, MEDIA_TYPE.THUMBNAIL)
            ),
            ...this.getMetadataToSend(metadata)
        };
    }
    
    getMetadataToSend (metadata) {
        return {
            media_id: metadata.id,
            title: metadata.fulltitle,
            channel: metadata.channel,
            duration: metadata.duration,
            fps: metadata.fps,
            url: metadata.webpage_url
        }
    }

    /**
     * Returns a JSON object with the following properties:
     *  - status: MEDIA_STATUS
     * @param {*} videoId - String of the youtube video id or url
     */
    async getMedia(videoId) {
        try {
            if (!IS_PYTHON_INSTALLED()) {
                return {
                    status: MEDIA_STATUS.NOT_READY
                };
            }
            
            let id = this.videoid_cache_lookup[videoId];
            let metadata;
            if (typeof id == 'undefined') {
                metadata = await YTDL.get_video_metadata(videoId);
                console.log(metadata);
                id = metadata.id;
                this.videoid_cache_lookup[videoId] = id;
            }
            else {
                metadata = this.metadata_cache[id];
            }

            // Status does not exist, get current status and store it for a bit
            if (id in this.in_progress_media === false) {
                // Check if media is in blob store
                const video_blob_exists = await azBlobManager.blob_exists(
                    CONTAINER_TYPE.VIDEO,
                    this.getMediaFilename(id, MEDIA_TYPE.VIDEO)
                );
                const audio_blob_exists = await azBlobManager.blob_exists(
                    CONTAINER_TYPE.AUDIO,
                    this.getMediaFilename(id, MEDIA_TYPE.AUDIO)
                );
                if (!video_blob_exists || !audio_blob_exists) {
                    // Begin media download/upload
                    this.in_progress_media[id] =
                        this.getNewInProgressMedia(metadata);
                    this.processMedia(metadata);
                } else {
                    // Store already completed media metadata for a while
                    this.in_progress_media[id] = this.getCompletedMedia(metadata);
                }
            }

            // Update last access time for deletion policy
            this.in_progress_media[id].last_access_time_iso =
                new Date().toISOString();
            console.log(this.in_progress_media[id]);

            return this.in_progress_media[id];
        } catch (error) {
            console.log(error);
            return {
                status: MEDIA_STATUS.ERROR,
            };
        }
    }
    
    async deleteInProgressMediaInterval(id) {
        // Interval runs once a minute with 10ms between each media check
        const DELETABLE_MEDIA_STATUS = [
            MEDIA_STATUS.NOT_STARTED,
            MEDIA_STATUS.UNAVAILABLE,
            MEDIA_STATUS.ERROR,
            MEDIA_STATUS.COMPLETED
        ];
        setInterval(async () => {
            const current_time = new Date();
            
            for (const id in this.in_progress_media) {
                await this.sleep(10)
                
                if (!this.in_progress_media[id] || !this.in_progress_media[id].last_access_time_iso) {
                    continue;
                }
                
                const last_access_time = new Date(this.in_progress_media[id].last_access_time_iso);
                const time_since_last_access = current_time - last_access_time;
                
                if (time_since_last_access > MEMORY_RETENTION_TIME && DELETABLE_MEDIA_STATUS.includes(this.in_progress_media[id].status)) {
                    console.log(`Deleting in memory media ${id}`);
                    delete this.in_progress_media[id];
                    delete this.metadata_cache[id];
                    
                    // Clear all videoId to id references
                    for (const videoId in this.videoid_cache_lookup) {
                        if (this.videoid_cache_lookup[videoId] == id) {
                            delete this.videoid_cache_lookup[videoId];
                        }
                    }
                }
            }
            
        }, 1000 * 60);
    }
    
    /**
     * Checks if the media is from a verified source (youtube), no age limit, etc
     * @param {*} metadata 
     */
    verifyMediaIsOK(metadata) {
        
        // ONLY YOUTUBE. OTHER SITES COULD BE BAD.
        if (!MEDIA_SITES.includes(metadata.extractor)) {
            throw new Error(
                `Unsupported media source: ${metadata.extractor}`
            );
        }
        
        if (metadata.age_limit != 0) {
            throw new Error(
                `Media source has age limit: ${metadata.age_limit}`
            );
        }

        if (metadata.is_live != 0) {
            throw new Error(
                `Media source is live`
            );
        }
        
        if (metadata.duration > MAX_MEDIA_DURATION) {
            throw new Error(
                `Media source has too long of a duration: ${metadata.duration}`
            );
        }
    }

    /**
     * Takes a youtube video id and gets the metadata, downloads the video and audio, and uploads it to the blob store
     * @param {*} videoId
     */
    async processMedia(metadata) {
        const id = metadata.id;
        try {
            this.in_progress_media[id].status = MEDIA_STATUS.CONVERTING;

            this.verifyMediaIsOK(metadata);
            
            await this.downloadAndUploadThumbnail(metadata);
            this.in_progress_media[id].thumbnail = azBlobManager.get_download_url(
                CONTAINER_TYPE.THUMBNAILS,
                this.getMediaFilename(metadata.id, MEDIA_TYPE.THUMBNAIL)
            ),
            
            await this.downloadAndUploadMedia(metadata, MEDIA_TYPE.VIDEO);
            await this.downloadAndUploadMedia(metadata, MEDIA_TYPE.AUDIO);

            this.in_progress_media[id] = this.getCompletedMedia(metadata);
            console.log(this.in_progress_media[id]);

            // Wait 1 minute
            await this.sleep(1000 * 60 * 1);

            // Delete old media
            this.deleteDownloadedMedia(metadata, MEDIA_TYPE.VIDEO);
            this.deleteDownloadedMedia(metadata, MEDIA_TYPE.AUDIO);
        } catch (error) {
            console.log(error);
            if (error.toString().includes('Video unavailable')) {
                this.in_progress_media[id].status = MEDIA_STATUS.UNAVAILABLE;
                return;
            }
            this.in_progress_media[id].status = MEDIA_STATUS.ERROR;
        }
    }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    getMediaFilename(id, media_type) {
        return `${id}-${media_type}`;
    }

    /**
     * Removes all previously downloaded media files from the downloads folder
     */
    cleanupOldDownloadedMedia() {
        fs.readdir(DOWNLOAD_DIR, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(DOWNLOAD_DIR, file), (err) => {
                    if (err) throw err;
                });
            }
        });
    }

    deleteDownloadedMedia(metadata, media_type) {
        const filename = this.getMediaFilename(metadata.id, media_type);
        const filepath = path.join(DOWNLOAD_DIR, filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    }

    /**
     * Downloads thumbnails from youtube and uploads them to blob storage
     * @param {*} metadata
     * @param {*} media_type
     */
     async downloadAndUploadThumbnail(metadata) {
        const id = metadata.id;
        const thumbnailComparator = (p, c) => {
            // Prefer thumbnails with resolution metadata
            if (!c.resolution) {
                return p;
            }
            
            // Restrict thumbnail size to 1920x1080.
            // if (c.height > 720 || c.width > 1280) {
            //     return p;
            // }
    
            // Prefer highest preference thumbnails
            return p.preference > c.preference ? p : c;
        };
        
        // Get best thumbnail info
        const format = metadata.thumbnails.reduce(thumbnailComparator);

        console.log(format);

        if (!format) {
            throw new Error(
                `Could not find thumbnail for ${id}`
            );
        }
        
        const filename = this.getMediaFilename(id, MEDIA_TYPE.THUMBNAIL);
        const filepath = path.join(DOWNLOAD_DIR, filename);

        // File does not exist locally, so download it
        console.log("START THUMBNAIL DONWLOAD")
        if (!fs.existsSync(filepath)) {
            try {
                await this.downloadThumbnail(format.url, filepath);
            } catch (error) {
                console.log(error);
                return;
            }
        }

        console.log("START THUMBNAIL UPLOAD")
        await azBlobManager.uploadFile(
            CONTAINER_TYPE.THUMBNAILS,
            filename,
            filepath,
            (progress) => {
                console.log(
                    `Upload thumbnail progress: ${
                        progress.loadedBytes
                    } / ${filename}`
                );
            }
        );
    }
    
    async downloadThumbnail(url, filepath) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                if (res.statusCode === 200) {
                    res.pipe(fs.createWriteStream(filepath))
                        .on('error', reject)
                        .once('close', () => resolve(filepath));
                } else {
                    // Consume response data to free up memory
                    res.resume();
                    reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
                }
            });
        });
    }

    /**
     * Downloads
     * @param {*} metadata
     * @param {*} media_type
     */
    async downloadAndUploadMedia(metadata, media_type) {
        const id = metadata.id;
        const formatComparator =
            media_type == MEDIA_TYPE.VIDEO
                ? this.videoFormatComparator
                : this.audioFormatComparator;
        // Get best quality (max file size) media format
        const format = metadata.formats.reduce(formatComparator);

        console.log(format);

        if (!format) {
            throw new Error(
                `Could not find media format for ${media_type} / ${id}`
            );
        }
        
        const filename = this.getMediaFilename(id, media_type);
        const filepath = path.join(DOWNLOAD_DIR, filename);

        // File does not exist locally, so download it
        if (!fs.existsSync(filepath)) {
            await this.downloadMedia(
                metadata.webpage_url,
                {
                    format_id: format.format_id,
                    output_filename: filepath,
                },
                id,
                media_type
            );
        }

        const container_type =
            media_type == MEDIA_TYPE.VIDEO
                ? CONTAINER_TYPE.VIDEO
                : CONTAINER_TYPE.AUDIO;
        const up_progress_var =
            media_type == MEDIA_TYPE.VIDEO ? 'v_up_progress' : 'a_up_progress';
        await azBlobManager.uploadFile(
            container_type,
            filename,
            filepath,
            (progress) => {
                this.in_progress_media[id][up_progress_var] =
                    progress.loadedBytes / format.filesize;
                // console.log(
                //     `Upload progress: ${
                //         progress.loadedBytes / format.filesize
                //     } / ${filename}`
                // );
            }
        );
        this.in_progress_media[id][up_progress_var] = 1;
    }

    videoFormatComparator(p, c) {
        if (c.format_note == 'tiny') {
            return p;
        }
        
        // Restrict video size to 1920x1080. Larger videos like 4k have huge filesizes.
        if (c.height > 1080 || c.width > 1920) {
            return p;
        }

        return p.filesize > c.filesize ? p : c;
    }

    audioFormatComparator(p, c) {
        if (c.format_note != 'tiny') {
            return p;
        }

        return p.filesize > c.filesize ? p : c;
    }

    async downloadMedia(url, options, id, media_type) {
        return new Promise((resolve, reject) => {
            const dl_progress_var =
                media_type == MEDIA_TYPE.VIDEO
                    ? 'v_dl_progress'
                    : 'a_dl_progress';
            YTDL.download_video(url, options)
                .on('progress', (progress) => {
                    console.log(
                        progress.percent,
                        progress.totalSize,
                        progress.currentSpeed,
                        progress.eta
                    );
                    // progress.percent is 0-100
                    this.in_progress_media[id][dl_progress_var] =
                        progress.percent / 100;
                })
                .on('youtubeDlEvent', (eventType, eventData) =>
                    console.log(eventType, eventData)
                )
                .on('error', (error) => {
                    throw new Error(error);
                })
                .on('close', () => {
                    this.in_progress_media[id][dl_progress_var] = 1;
                    resolve();
                });
        });
    }

    /**
     * Returns a UUID that is not used in the video/audio blob stores
     */
    async getUUID() {
        const uuid = uuidv1();
        while (await azBlobManager.blob_exists(CONTAINER_TYPE.VIDEO, uuid)) {
            uuid = uuidv1();
        }
        return uuid;
    }
}

const mediaManager = new MediaManager();
// setTimeout(() => {
//     mediaManager.getMedia('https://www.youtube.com/watch?v=pdsGv5B9OSQ');
// }, 1000);
module.exports = {
    mediaManager,
};

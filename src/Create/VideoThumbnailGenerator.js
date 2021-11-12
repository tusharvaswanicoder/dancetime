// Originally from https://github.com/wangweiwei/video-metadata-thumbnails/blob/master/src/video/index.ts
import { THUMBNAIL_INTERVAL } from '../constants';


export class Video {
    constructor(blob) {
        if (!blob) {
            throw new Error('__NAME__ params error');
        }
        this.isStarted = true;
        this.count = 0;
        this.thumbnails = [];

        this.videoElement = document.createElement('video');
        this.videoElement.preload = 'metadata';
        this.videoElement.muted = true;
        this.videoElement.volume = 0;
        this.videoElement.crossOrigin = 'anonymous';
        this.option = {
            interval: 1,
            scale: 0.4,
            quality: 0.4,
            start: 1
        };

        this.canvas = document.createElement('canvas');
        this.canvasContext = this.canvas.getContext('2d');

        const URL = window.URL || window.webkitURL;
        this.videoElement.src =
            typeof blob === 'string' || blob instanceof String
                ? blob
                : URL.createObjectURL(blob);

        const endedHandler = () => {
            const _blob = this.videoElement.src;
            if (!(typeof _blob === 'string' || _blob instanceof String)) {
                URL.revokeObjectURL(this.videoElement.src);
            }
            this.videoElement.removeEventListener('ended', endedHandler, false);
        };
        this.videoElement.addEventListener('ended', endedHandler, false);
    }

    getThumbnails(options, progress_cb) {
        if (options) {
            this.option = Object.assign(this.option, options);
        }
        return new Promise((resolve, reject) => {
            
            const canplayHandler = () => {
                const interval = this.option.interval || 1;
                const { videoWidth, videoHeight, duration } = this.videoElement;
                if (!this.isStarted) {
                    this.videoElement.currentTime += interval;
                } else {
                    this.videoElement.currentTime = this.option.start || 0;
                    this.isStarted = false;
                }
            };
            
            const timeupdateHandler = () => {
                const { option, videoElement, canvasContext, thumbnails } =
                    this;
                const { videoWidth, videoHeight, duration } = videoElement;
                const { quality, interval, start, end, scale } = option;
                const { currentTime } = videoElement;
                const isEnded =
                    currentTime >= duration ||
                    currentTime > (end === undefined ? duration : end);
                const $interval = interval || 1;
                const $videoWidth = videoWidth * (scale || 1);
                const $videoHeight = videoHeight * (scale || 1);

                try {
                    this.canvas.width = $videoWidth;
                    this.canvas.height = $videoHeight;
                    this.canvasContext.drawImage(
                        this.videoElement,
                        0,
                        0,
                        $videoWidth,
                        $videoHeight
                    );

                    if (!this.canvas.toBlob) {
                        throw new Error('canvas.toBlob does not exist');
                    } else {
                        this.canvas.toBlob(
                            (blob) => {
                                canvasContext.clearRect(
                                    0,
                                    0,
                                    $videoWidth,
                                    $videoHeight
                                );
                                canvasContext.restore();

                                if (isEnded) {
                                    videoElement.removeEventListener(
                                        'canplaythrough',
                                        canplayHandler,
                                        false
                                    );
                                    videoElement.removeEventListener(
                                        'timeupdate',
                                        timeupdateHandler,
                                        false
                                    );
                                    resolve(this.thumbnails);
                                    return;
                                }

                                thumbnails[start + $interval * this.count] = blob;
                                this.count++;
                                
                                if (progress_cb) {
                                    progress_cb((start + $interval) / duration);
                                }
                            },
                            'image/jpeg',
                            quality
                        );
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            const progressHandler = () => {
                this.videoElement.currentTime += interval;
                console.log(this.videoElement.currentTime)
                this.videoElement.removeEventListener(
                    'progress',
                    progressHandler,
                    false
                );
            };

            // Safari
            if (
                /^((?!chrome).)*safari((?!chrome).)*$/i.test(
                    navigator.userAgent
                )
            ) {
                this.videoElement.addEventListener(
                    'progress',
                    progressHandler,
                    false
                );
            }

            const endedHandler = () => {
                this.videoElement.removeEventListener(
                    'progress',
                    progressHandler,
                    false
                );
                this.videoElement.removeEventListener(
                    'ended',
                    endedHandler,
                    false
                );
                this.videoElement.removeEventListener(
                    'canplaythrough',
                    canplayHandler,
                    false
                );
                this.videoElement.removeEventListener(
                    'timeupdate',
                    timeupdateHandler,
                    false
                );
                this.videoElement.removeEventListener(
                    'error',
                    errorHandler,
                    false
                );
            };
            const errorHandler = () => {
                const { error } = this.videoElement;
                if (error) {
                    reject(
                        new Error(
                            `__NAME__ error ${error.code}; details: ${error.message}`
                        )
                    );
                } else {
                    reject(new Error('__NAME__ unknown error'));
                }
                this.videoElement.removeEventListener(
                    'progress',
                    progressHandler,
                    false
                );
                this.videoElement.removeEventListener(
                    'ended',
                    endedHandler,
                    false
                );
                this.videoElement.removeEventListener(
                    'canplaythrough',
                    canplayHandler,
                    false
                );
                this.videoElement.removeEventListener(
                    'timeupdate',
                    timeupdateHandler,
                    false
                );
                this.videoElement.removeEventListener(
                    'error',
                    errorHandler,
                    false
                );
            };
            this.videoElement.addEventListener(
                'canplaythrough',
                canplayHandler,
                false
            );
            this.videoElement.addEventListener(
                'timeupdate',
                timeupdateHandler,
                false
            );
            this.videoElement.addEventListener('ended', endedHandler, false);
            this.videoElement.addEventListener('error', errorHandler, false);
        });
    }
}

export async function getThumbnailsInParalell(blob, progress_cb) {
    const num_parallel = 3;
    const interval = THUMBNAIL_INTERVAL;
    let total_progress = 0;
    // TODO: transfer this work to WebWorkers in the background or something
    return new Promise((resolve, reject) => {
        let thumbnails = {};
        let num_completed = 0;
        
        for (let i = 0; i < num_parallel; i++) {
            const video = new Video(blob);
            
            function thumbnailProgressCB (progress) {
                total_progress += 1 / (video.videoElement.duration / interval);
                if (progress_cb) {
                    progress_cb(Math.min(1, total_progress));
                }
            }
            
            video.getThumbnails({
                start: i * interval,
                interval: num_parallel * interval
            }, thumbnailProgressCB).then((returned_thumbnails) => {
                thumbnails = Object.assign(thumbnails, returned_thumbnails);
                num_completed++;
                
                if (num_completed == num_parallel) {
                    resolve(thumbnails);
                }
            }).catch((error) => {
                reject(error);
            })
        }
    })
}

/**
 * @param blob Blob
 * @return Promise
 */
export async function getThumbnails(blob) {
    const video = new Video(blob);
    let thumbnails = await video.getThumbnails();
    return thumbnails;
}

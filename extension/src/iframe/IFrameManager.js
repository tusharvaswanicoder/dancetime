import browser from 'webextension-polyfill';
import tfjs from '../TFJS';
import { GetRoundedTimeFromTime } from './utils';

// Allowed domains for the iframe content_script to run in
const ALLOWED_DOMAINS = ["www.youtube.com", "youtube.com"]
// Allowed domains for the iframe to be in for this to run
const ALLOWED_REFERRERS = ["http://localhost:3001/", "https://dancetime.io/"];

export default class IFrameManager {
    constructor () {
        this.initialized = false;
        this.analyzing = false;
        this.frames_analyzed = {};
    }

    async initialize () {
        if (!this.is_allowed_domain()) {
            return;
        }

        await tfjs.initialize();
        this.initialized = true;
    }

    async start_analysis (args) {
        if (!this.initialized) {
            return;
        }

        if (this.analyzing) {
            return;
        }

        this.video = this.get_video_element();
        this.previousPlaybackRate = this.video.playbackRate;
        this.video.playbackRate = args.playbackRate || 0;
        this.analyzing = true;
        this.firstFrameDetected = false;
        this.frames_analyzed = {};

        while (this.video.readyState != 4) {
            await this.sleep(200);
        }
        
        this.on_analysis_frame();
    }

    sleep (ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async on_analysis_frame () {
        const frameTime = GetRoundedTimeFromTime(this.video.currentTime);
        const shouldContinue = this.analyzing && !this.video.ended;

        // This frame was already analyzed
        if (this.frames_analyzed[frameTime] && shouldContinue) {
            this.raf = requestAnimationFrame(() => {
                this.on_analysis_frame();
            });
            return;
        }

        const pose = await tfjs.detectFrame(this.video);
        if (pose) {
            // Map keypoints to 1920x1080 rectangle
            pose.keypoints = pose.keypoints.map((keypoint) => {
                return {
                    ...keypoint,
                    x: keypoint.x / this.video.videoWidth * 1920,
                    y: keypoint.y / this.video.videoHeight * 1080
                }
            })
            this.frames_analyzed[frameTime] = pose;
        }

        if (shouldContinue) {
            this.raf = requestAnimationFrame(() => {
                this.on_analysis_frame();
            });
        }

        if (!this.firstFrameDetected) {
            // Play video once first TFJS is loaded and analyzing
            this.firstFrameDetected = true;
            this.video.play();
        }

        if (!shouldContinue || this.video.currentTime >= this.video.duration) {
            this.stop_analysis();
        }
    }

    stop_analysis () {
        if (!this.analyzing) {
            return;
        }

        this.analyzing = false;
        this.video.playbackRate = this.previousPlaybackRate || 1;

        if (this.raf) {
            this.raf = cancelAnimationFrame(this.raf);
        }

        this.get_analysis();
    }

    send_message_to_dancetime (data) {
        data.source = 'dancetime-yt-iframe';
        data.passthrough_event = true;
        browser.runtime.sendMessage(data);
    }

    get_analysis () {
        if (!this.is_allowed_domain()) {
            return;
        }

        this.send_message_to_dancetime({
            event_name: 'dancetime-iframe-message:get-analysis',
            data: {
                keypoints: this.frames_analyzed
            }
        })
    }

    get_status () {
        if (!this.is_allowed_domain()) {
            return;
        }

        this.send_message_to_dancetime({
            event_name: 'dancetime-iframe-message:get-status',
            data: {
                analyzing: this.analyzing,
                initialized: this.initialized
            }
        })
    }

    is_allowed_domain () {
        return ALLOWED_DOMAINS.includes(window.document.domain) && ALLOWED_REFERRERS.includes(window.document.referrer);
    }

    get_video_element () {
        return document.querySelector('video');
    }
}
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

    start_analysis () {
        if (!this.initialized) {
            return;
        }

        if (this.analyzing) {
            return;
        }

        console.log('Starting analysis...');

        this.video = this.get_video_element();
        this.analyzing = true;
        this.firstFrameDetected = false;
        this.frames_analyzed = {};
        this.on_analysis_frame();
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
        this.frames_analyzed[frameTime] = pose || {};
        console.log(pose);

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
    }

    stop_analysis () {
        if (this.analyzing) {
            return;
        }

        this.analyzing = false;

        if (this.raf) {
            this.raf = cancelAnimationFrame(this.raf);
        }
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
                keypoints: this.keypoints
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
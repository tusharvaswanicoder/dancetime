import browser from 'webextension-polyfill';
import IFrameManager from './iframe/IFrameManager';

console.log(`content_script_iframe ${window.document.domain}`);

const ifm = new IFrameManager();
ifm.initialize();

browser.runtime.onMessage.addListener((data) => {
    if (data.source == 'dancetime-yt-iframe') {
        return;
    }

    data.main_passthrough = false;

    const func = EVENTS[data.event_name];
    if (func) {
        ifm[func]();
    }
});

const EVENTS = {
    ['dancetime-message:start-analysis']: 'start_analysis',
    ['dancetime-message:stop-analysis']: 'stop_analysis',
    ['dancetime-message:get-analysis']: 'get_analysis',
    ['dancetime-message:get-status']: 'get_status'
}
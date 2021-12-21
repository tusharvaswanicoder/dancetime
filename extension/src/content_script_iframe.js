import browser from 'webextension-polyfill';
import tfjs from './TFJS';

// const ALLOWED_DOMAINS = ["www.youtube.com", "youtube.com"]
// if (!ALLOWED_DOMAINS.includes(window.document.domain)) {
//     return;
// }

console.log(`content_script_iframe ${window.document.domain}`);

const video = document.querySelector('video');
console.log(video);

const StartTFJSAnalysis = () => {
    console.log('starting analysis')

    let shouldContinue = true;
    const onFrame = async () => {
        const pose = await tfjs.detectFrame(video);
        console.log(pose);

        if (shouldContinue) {
            requestAnimationFrame(onFrame)
        }

    }

    onFrame();


    setTimeout(() => {
        console.log('stopping analysis')
        shouldContinue = false;
    }, 15000);
}

// tfjs.initialize();

const valid_referrers = [
    'https://b-a.dev/',
    'https://b-a.dev/japan/',
    'http://localhost:3001/',
];

// TODO: check domain to ensure that it is youtube
// console.log(document.referrer);
// if (
//     isIframe &&
//     document.domain == 'www.youtube.com' &&
//     valid_referrers.includes(document.referrer)
// ) {


browser.runtime.onMessage.addListener((data) => {
    if (data.source == 'dancetime-yt-iframe') {
        return;
    }

    data.main_passthrough = false;

    const func = EVENTS[data.event_name];
    if (func) {
        func(data);
    }
});

const SendMessageToDanceTime = (data) => {
    data.source = 'dancetime-yt-iframe';
    data.passthrough_event = true;
    browser.runtime.sendMessage(data);
}


const EVENTS = {
    ['dancetime-message:start-analysis']: StartTFJSAnalysis
}
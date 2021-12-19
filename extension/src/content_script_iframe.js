import browser from 'webextension-polyfill';
// import tfjs from './TFJS';

// const ALLOWED_DOMAINS = ["www.youtube.com", "youtube.com"]
// if (!ALLOWED_DOMAINS.includes(window.document.domain)) {
//     return;
// }

console.log(`content_script_iframe ${window.document.domain}`);

setTimeout(() => {
    browser.runtime.sendMessage('hello from IFRAME runtime')
}, 3000);

// tfjs.initialize();

const valid_referrers = [
    'https://b-a.dev/',
    'https://b-a.dev/japan/',
    'http://localhost:3001/',
];

const key = 'background';
const isIframe = !(self == top);
console.log(`iframe: ${isIframe}`);
// This gets the item from the popup menu in the extension icon
browser.storage.local.get(key).then((data) => {
    // console.log(document.referrer);
    if (
        isIframe &&
        document.domain == 'www.youtube.com' &&
        valid_referrers.includes(document.referrer)
    ) {
        // console.log(document);

        // setTimeout(() => {
        //     console.log('posting message to top...');
        //     console.log(top);
        //     browser.extension
        //         .getBackgroundPage()
        //         .postMessage('hello from youtube');
        //     console.log('posted message to top');
        // }, 2000);
        // setInterval(() => {
        //     console.log(document)
        //     document.body.querySelectorAll('video').forEach((v) => {
        //         console.log(v.currentTime)
        //     })
        // }, 1000);
    }
});

browser.runtime.onMessage.addListener((request) => {
    console.log(window);
    console.log('IFRAME Message from the background script:');
    console.log(request.greeting);
    return Promise.resolve({ response: 'hello i am the iframe' });
});

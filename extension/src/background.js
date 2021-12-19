import browser from 'webextension-polyfill';

console.log('background loaded')


browser.runtime.onMessage.addListener((request) => {
    console.log('BACKGROUND onMessage:');
    console.log(request);
    // return Promise.resolve({ response: 'Hi from content script' });
});

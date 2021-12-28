import browser from 'webextension-polyfill';

// Messages from extension background
browser.runtime.onMessage.addListener((data) => {
    if (data.main_passthrough) {
        return;
    }

    top.postMessage(data);
})

// Messages from dancetime.io SVELTE to Iframe
top.addEventListener('message', (evt) => {
    // Just passing through data, do not process here
    if (evt.data.main_passthrough) {
        return;
    }

    evt.data.main_passthrough = true;
    evt.data.passthrough_event = true;
    browser.runtime.sendMessage(evt.data);
});


/*
DATA FLOW:

DT: send message to CS MAIN
    top.postMessage
CS MAIN: receive message from DT
    top.addEventListener('message', (evt) => {
CS MAIN: send message to EXT BACKGROUND
    browser.runtime.sendMessage
EXT BACKGROUND: receive message from CS MAIN
    browser.runtime.onMessage.addListener((request) => {
EXT BACKGROUND: send message to CS IFRAME
    browser.tabs.sendMessage
CS IFRAME: receive message from EXT BACKGROUND
    browser.runtime.onMessage.addListener((request) => {
        
if a response is needed (like getting keyframe data):
        
CS IFRAME: do stuff, get data, then send back
    browser.runtime.sendMessage
EXT BACKGROUND: receive message from CS IFRAME
    browser.runtime.onMessage.addListener((request) => {
EXT BACKGROUND: send message to CS MAIN
    browser.tabs.sendMessage
CS MAIN: receive message from EXT BACKGROUND
    browser.runtime.onMessage.addListener((request) => {
CS MAIN: send message to DT
    top.postMessage
DT: receive message from CS MAIN
    top.addEventListener('message', (evt) => {
*/
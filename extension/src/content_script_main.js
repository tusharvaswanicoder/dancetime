import browser from 'webextension-polyfill';

// const ALLOWED_DOMAINS = ["localhost", "dancetime.io"]
// if (!ALLOWED_DOMAINS.includes(window.document.domain)) {
//     return;
// }

console.log(`content_script_main ${window.document.domain}`);

setTimeout(() => {
    browser.runtime.sendMessage('runtime message from main')
    // WORKS to POST messages to the webpage
    top.postMessage('hello from MAIN');
    
    // WORKS to RECEIVE messages from the webpage
    top.addEventListener('message', (evt) => {
        console.log('got top message')
        console.log(evt);
    })
}, 3000);

setTimeout(() => {
    browser.runtime.sendMessage('hello from MAIN runtime')
}, 1000);

browser.runtime.onMessage.addListener((request) => {
    // if (request.name == "")
    console.log('MAIN Message from the background script:');
    console.log(request.greeting);
    return Promise.resolve({ response: 'Hi from content script' });
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
import browser from 'webextension-polyfill';

function onError(error) {
    console.error(`Error: ${error}`);
}

function sendMessageToTabs(tabs, data) {
    for (let tab of tabs) {
        browser.tabs
            .sendMessage(tab.id, data)
            .catch(onError);
    }
}
function sendMessageToThisTab(data) {
    browser.tabs
        .query({
            currentWindow: true,
            active: true,
        })
        .then((tabs) => {
            sendMessageToTabs(tabs, data);
        })
        .catch(onError);
}

function fetchTFJSModel(data) {
    return new Promise(async (resolve, reject) => {
        console.log('fetchTFJSModel');
        console.log(data);
        // https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4/model.json?tfjs-format=file
        const model_path_start = 'https://tfhub.dev/google/tfjs-model/'
        if (!data.path || !data.path.startsWith(model_path_start)) {
            reject('Invalid path');
            return;
        }

        const result = await fetch(data.path, data.init);
        console.log(result);
        resolve(data.path.includes('.json') ? result.json() : result.arrayBuffer());
    })
}

// Passthrough for messages from iframe or main (ext)
browser.runtime.onMessage.addListener((data) => {
    console.log('background onMessage')
    console.log(data);
    if (data.fetchModel) {
        return fetchTFJSModel(data);
    } else if (data.passthrough_event) {
        sendMessageToThisTab(data);
    }
});

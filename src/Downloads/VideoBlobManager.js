import Dexie from 'dexie';

const DB_VERSION = 1.0;
const DB_NAME = "MediaBlobs_Database";
const DB_SCHEMA = {
    blobs: "&name" // Do not index the media blob, as it is too large
}

function GetDB()
{
    const db = new Dexie(DB_NAME);
    db.version(DB_VERSION).stores(DB_SCHEMA);
    return db;
}

/**
 * 
 * @param {*} blob Blob that was downloaded from RequestVideoBlob
 * @param {*} name Name to store to blob under. Should probably be the youtube video id
 * @param {*} cb Callback function to be called after the blob is stored
 */
export function StoreMediaBlob(blob, name, cb) 
{
    const db = GetDB();

    // But DO store the media blob
    db.blobs.put({name: name, blob: blob}).then(() => {
        cb()
    }).catch(function(error) {
       console.error(`StoreMediaBlob error: ${error}`)
    });
}

/**
 * Given a string video id, return the video blob stored under that id, if any.
 * @param {string} name 
 * @param {*} cb Callback function to be called after the blob is stored.
 * Contains the blob containing the video, or null if no video is stored under that id.
 */
export function GetMediaBlobFromDB(name, cb)
{
    const db = GetDB();

    db.blobs.get({name: name}).then((blob_data) => {
        cb(blob_data ? blob_data.blob : null)
    }).catch(function(error) {
       console.error(`GetMediaBlobFromDB error: ${error}`)
    });
}

/**
 * Given a string video id, deletes the video blob stored under that id, if any.
 * @param {string} name 
 * @param {*} cb Callback function to be called after the blob is deleted. (optional)
 */
 export function DeleteMediaBlobInDB(name, cb)
 {
     const db = GetDB();
 
     db.blobs.where({name: name}).delete().then(() => {
        if (cb) {
            cb();
        }
     }).catch(function(error) {
        console.error(`DeleteMediaBlobInDB error: ${error}`)
     });
 }

/**
 * 
 * @param {string} url URL to download the video from, eg. mywebsite.com/video.mp4
 * @param {function} cb Callback function when an event fires from the request.
 * Contains the following parameters:
 *  - event: The event that fired.
 *  - evt: The event object.
 *  - blob: The blob object. (only for the 'load' event)
 *  - progress: The progress of the download. (only for 'progress' event)
 */
export function GetMediaBlobFromURL(url, cb) {
    // Create XHR
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    
    // Set the responseType to blob
    xhr.responseType = "blob";
    
    if (url.endsWith('-t')) {
        xhr.overrideMimeType("img/jpeg");
    }
    
    xhr.addEventListener("progress", (evt) => {
        if (evt.lengthComputable) {
            const percentComplete = (evt.loaded / evt.total);
            cb({
                event: "progress",
                progress: percentComplete,
                evt: evt,
                xhr: xhr
            })
        }
    });
    
    xhr.addEventListener("error", (evt) => {
        cb({
            event: "error",
            evt: evt,
            xhr: xhr
        })
    });
    xhr.addEventListener("abort", (evt) => {
        cb({
            event: "abort",
            evt: evt,
            xhr: xhr
        })
    });

    xhr.addEventListener("load", (evt) => {
        if (xhr.status === 200) {
            // IF THIS DOES NOT WORK:
            // blob = xhr.response.slice(0, xhr.response.size, "video/mp4");
            // or: new Blob([xhr.response], {type: "video/mp4"});
            cb({
                event: "load",
                blob: xhr.response,
                evt: evt,
                xhr: xhr
            })
        }
    });
    
    // Send XHR
    xhr.send();
}
import Dexie from 'dexie';

// These should align with the DB_SCHEMA below
export const DB_TABLES = {
    KEYPOINTS: 'keypoints',
    LOCAL_KEYPOINTS: 'local_keypoints',
    CHARTS: 'charts'
}

const DB_VERSION = 1.0;
const DB_NAME = 'ChartsKeypoints_Database';
const DB_SCHEMA = {
    keypoints: '&uuid', // Do not index the video blob, as it is too large
    local_keypoints: '&uuid',
    charts: '&uuid',
};

function GetDB() {
    const db = new Dexie(DB_NAME);
    db.version(DB_VERSION).stores(DB_SCHEMA);
    return db;
}

export function StoreObject(object, uuid, db_name, cb) {
    const db = GetDB();

    db[db_name]
        .put({ uuid: uuid, object: object })
        .then(() => {
            cb();
        })
        .catch(function (error) {
            console.error(`StoreObject error: ${error}`);
        });
}

export function GetObjectFromDB(uuid, db_name) {
    const db = GetDB();

    return new Promise((resolve, reject) => {
        db[db_name]
            .get({ uuid: uuid })
            .then((object_data) => {
                resolve(object_data ? object_data.object : null);
            })
            .catch(function (error) {
                reject(`GetObjectFromDB error: ${error}`);
            });
    })
}

export function DeleteObjectInDB(uuid, db_name, cb) {
    const db = GetDB();

    db[db_name]
        .where({ uuid: uuid })
        .delete()
        .then(() => {
            if (cb) {
                cb();
            }
        })
        .catch(function (error) {
            console.error(`DeleteObjectInDB error: ${error}`);
        });
}

/**
 *
 * @param {string} url URL to download the keypoints from, eg. mywebsite.com/keypoints.json
 * @param {function} cb Callback function when an event fires from the request.
 * Contains the following parameters:
 *  - event: The event that fired.
 *  - evt: The event object.
 *  - object: The json object with keypoints. (only for the 'load' event)
 *  - progress: The progress of the download. (only for 'progress' event)
 */
export function GetChartKeypointsFromURL(url, cb) {
    // Create XHR
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    // Set the responseType to json
    xhr.responseType = 'json';

    xhr.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
            const percentComplete = evt.loaded / evt.total;
            cb({
                event: 'progress',
                progress: percentComplete,
                evt: evt,
                xhr: xhr,
            });
        }
    });

    xhr.addEventListener('error', (evt) => {
        cb({
            event: 'error',
            evt: evt,
            xhr: xhr,
        });
    });
    xhr.addEventListener('abort', (evt) => {
        cb({
            event: 'abort',
            evt: evt,
            xhr: xhr,
        });
    });

    xhr.addEventListener('load', (evt) => {
        if (xhr.status === 200) {
            cb({
                event: 'load',
                object: xhr.response,
                evt: evt,
                xhr: xhr,
            });
        }
    });

    // Send XHR
    xhr.send();
}

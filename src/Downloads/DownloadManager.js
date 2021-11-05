import { writable } from "svelte/store";

import {
    GetVideoBlobFromURL,
    StoreVideoBlob,
    GetVideoBlobFromDB,
} from "./VideoBlobManager";

const DOWNLOADED_MEDIA_LOCALSTORE_NAME = 'downloadedMedia';

// Media status from server
const MEDIA_STATUS = {
    STARTING: 0,
    NOT_STARTED: 1,
    UNAVAILABLE: 2,
    RETRIEVING_METADATA: 3,
    CONVERTING: 4,
    ERROR: 5,
    COMPLETED: 6,
    NOT_READY: 7,
    DOWNLOADING: 8, // Client is downloading from server
    FINISHED: 9 // Download has completely finished
};

const MEDIA_TYPE = {
    VIDEO: 'v',
    AUDIO: 'a',
};

/*
Each media item is stored in the local storage as a JSON object.

[youtube id] : {
    "id": "youtube id",
    "title": "youtube video title",
    "channel": "youtube video channel name",
    "thumbnail": "thumbnail url",
    "download_date": "01298319203",
    "last_play_date": "12903123988",
    "filesize-a": "2321",
    "filesize-v": "301823"
    "indexedMediaBlob-v": "name of video blob in indexeddb",
    "indexedMediaBlob-a": "name of audio blob in indexeddb",
    "status": 3 // MEDIA_STATUS
    
    // If currently downloading...
    "download-progress-v": "0.5",
    "download-progress-a": "0.5",
    
}


*/

class DownloadManager {
    constructor () {
        if (!this.storageAvailable('localStorage')) {
            console.error('localStorage not available');
            return;
        }
        
        this.ensureMetadataInLocalStorage();
        this.metaData = JSON.parse(localStorage.getItem(DOWNLOADED_MEDIA_LOCALSTORE_NAME));
        this.metaDataStore = writable(this.metaData);
    }
    
    /**
     * Ensures that the downloadedMedia object is in localStorage so we can use it
     */
    ensureMetadataInLocalStorage () {
        if (!localStorage.getItem(DOWNLOADED_MEDIA_LOCALSTORE_NAME)) {
            localStorage.setItem(DOWNLOADED_MEDIA_LOCALSTORE_NAME, JSON.stringify({}));
        }
    }
    
    /**
     * Updates this.metadata in the localStorage and in the metaDataStore
     */
    updateMetadataInLocalStorage () {
        localStorage.setItem(DOWNLOADED_MEDIA_LOCALSTORE_NAME, JSON.stringify(this.metaData));
        this.metaDataStore.set(this.metaData);
    }
    
    /**
     * Returns information about all downloaded media (filesize, name, duration, etc)
     */
    getAllDownloadedMediaMetadata () {
        return this.metaData;
    }
    
    /**
     * Returns the percentage of the download of a specific youtube ID
     * @param {*} media_id 
     */
    getMediaPercentComplete (media_id) {
        // TODO
        if (this.metaData[media_id]) {
            return this.metaData[media_id].download_progress ? this.metaData[media_id].download_progress : 1;
        }
        
        return 0;
    }
    
    /**
     * Returns whether or not the download of a specific youtube ID is complete (audio and video)
     * @param {*} media_id 
     */
    async isMediaDownloaded (media_id) {
        // TODO
        if (this.metaData[media_id]) {
            return typeof this.metaData[media_id].download_progress == 'undefined';
        }
        
        return false;
    }
    
    /**
     * Returns metadata and audio/video blobs for a specific youtube ID, or undefined if it does not exist
     * @param {*} media_id 
     */
    async getDownloadedMedia (media_id) {
        return this.metaData[media_id];
    }
    
    updateMetadataStoreEntry (entry) {
        this.metaData = {
            ...this.metaData,
            [entry.media_id]: entry
        }
        this.updateMetadataInLocalStorage();
    }
    
    /**
     * Starts to download the media with the given youtube ID
     * @param {*} media_id 
     */
    async startMediaDownload (media_id) {
        console.log(`Starting download of ${media_id}`);
        let metadata_entry = {
            media_id: media_id,
            status: MEDIA_STATUS.STARTING
        }
        
        this.updateMetadataStoreEntry(metadata_entry);
        
        // Keep polling the API until we get download links
        let shouldFetchAPI = true;
        while (shouldFetchAPI) {
            try {
                console.log(`Fetching API ${media_id}`);
                const response = await this.fetchMediaFromAPI(media_id);
                console.log(response);
                metadata_entry = {...metadata_entry, ...response};
                
                if (response.status == MEDIA_STATUS.COMPLETED) {
                    shouldFetchAPI = false;
                }
                
                this.updateMetadataStoreEntry(metadata_entry);
            } catch (error) {
                console.log(error);
                return;
            }
            
            await this.sleep(1000);
        }
        
        metadata_entry.status = MEDIA_STATUS.DOWNLOADING;
        this.updateMetadataStoreEntry(metadata_entry);
        
        // Media is ready to download
        try {
            await this.downloadAndStoreBlobFromURL(metadata_entry, metadata_entry.video_url, MEDIA_TYPE.VIDEO);
            await this.downloadAndStoreBlobFromURL(metadata_entry, metadata_entry.audio_url, MEDIA_TYPE.AUDIO);
        } catch (error) {
            console.log(error);
            return;
        }
        
        metadata_entry.download_date = new Date().toISOString();
        metadata_entry.status = MEDIA_STATUS.COMPLETED;
        this.updateMetadataStoreEntry(metadata_entry);
        
        console.log(`Finished download of ${media_id}`);
        console.log(metadata_entry);
    }
    
    downloadAndStoreBlobFromURL (metadata_entry, url, media_type) {
        return new Promise((resolve, reject) => {
            GetVideoBlobFromURL(url, (data) => 
            {
                console.log(data);
                if (data.event == "load")
                {
                    // Completed download
                    const blobName = `${metadata_entry.media_id}-${media_type}`;
                    StoreVideoBlob(data.blob, blobName, () => 
                    {
                        metadata_entry[`indexedMediaBlob-${media_type}`] = blobName;
                        this.updateMetadataStoreEntry(metadata_entry);
                        console.log(`Stored ${blobName}!`);
                        resolve();
                    })
                }
                else if (data.event == "progress")
                {
                    // Downloading
                    metadata_entry[`download-progress-${media_type}`] = data.progress;
                    metadata_entry[`filesize-${media_type}`] = data.evt.total;
                    // Update metadata download progress
                    this.updateMetadataStoreEntry(metadata_entry);
                }
                else if (data.event == "error")
                {
                    metadata_entry.status = MEDIA_STATUS.ERROR;
                    reject();
                }
            })
        })
    }
    
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    fetchMediaFromAPI (media_id) {
        return new Promise((resolve, reject) => {
            const fetch_body = {
                media_id
            }
            
            fetch(`/api/video/${media_id}`)
            .then(res => res.json())
            .then(res => {
                resolve(res);
            }).catch((error) => {
                reject(error);
            });
        })
    }
    
    storageAvailable(type) {
        var storage;
        try {
            storage = window[type];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
        }
    }
    
    subscribe (f) {
        return this.metaDataStore.subscribe(f);
    }
    
}

export const dlManager = new DownloadManager();
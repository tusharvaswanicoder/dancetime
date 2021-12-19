import { writable } from "svelte/store";

// Media status from server
export const MEDIA_STATUS = {
    STARTING: 0,
    NOT_STARTED: 1,
    UNAVAILABLE: 2,
    RETRIEVING_METADATA: 3,
    CONVERTING: 4,
    ERROR: 5,
    COMPLETED: 6,
    NOT_READY: 7
};

/*
Each media item is stored as a JSON object in memory.

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

class StreamingManager {
    constructor () {
        this.metaData = {};
        this.metaDataStore = writable(this.metaData);
    }
    
    /**
     * Returns information about all in-memory media (filesize, name, duration, etc)
     */
    getAllMediaMetadata () {
        return this.metaData;
    }
    
    /**
     * Returns the percentage of the download of a specific youtube ID
     * @param {*} media_id 
     */
    getMediaPercentComplete (media_id) {
        const songData = this.metaData[media_id];
        if (!songData) {
            return 0;
        }
        
        if (songData.status == MEDIA_STATUS.COMPLETED) {
            return 100;
        }
        
        if (songData.status == MEDIA_STATUS.STARTING) {
            return 0;
        }
        
        if (songData.status == MEDIA_STATUS.UNAVAILABLE) {
            return 100;
        }
        
        let completion = 0;
        
        const conversion_weights = {
            ['v_up_progress']: 0.40,
            ['v_dl_progress']: 0.40,
            ['a_up_progress']: 0.10,
            ['a_dl_progress']: 0.10,
        }
        
        if (songData.status == MEDIA_STATUS.NOT_READY) {
            return 100; // 100 for full circle when waiting to start
        }
        
        if (songData.status == MEDIA_STATUS.CONVERTING) {
            Object.keys(conversion_weights).forEach((key) => {
                const weight = conversion_weights[key];
                if (songData[key]) {
                    completion += weight * songData[key];
                }
            })
            
            return completion * 100;
        }
        
        return 100;
    }
    
    /**
     * Returns whether or not the download of a specific youtube ID is ready to use (audio and video)
     * @param {*} media_id 
     */
    async isMediaReady (media_id) {
        try {
            const response = await this.queryMediaFromAPI(media_id);
            this.updateMetadataStoreEntry(response);
            if (response.status == MEDIA_STATUS.COMPLETED) {
                return true;
            }
        } catch (e) {
            
        }
        
        return false;
    }
    
    /**
     * Returns metadata and audio/video links for a specific youtube ID, or undefined if it does not exist
     * @param {*} media_id 
     */
    async getMedia (media_id) {
        return this.metaData[media_id];
    }
    
    updateMetadataStoreEntry (entry) {
        this.metaData = {
            ...this.metaData,
            [entry.media_id]: entry
        }
        this.metaDataStore.set(this.metaData);
    }
    
    isMediaDownloading (media_id) {
        if (this.metaData[media_id]) {
            return this.metaData[media_id].status != MEDIA_STATUS.COMPLETED;
        }
        return false;
    }
    
    isMediaDownloaded (media_id) {
        if (this.metaData[media_id]) {
            return this.metaData[media_id].status == MEDIA_STATUS.COMPLETED;
        }
        return false;
    }
    
    /**
     * Deletes a media entry from localStorage and any video elements from the DB
     * @param {*} entry 
     */
    deleteMetadataStoreEntry (entry) {
        if (entry.media_id) {
            delete this.metaData[entry.media_id];
        }
    }
    
    /**
     * Starts to download the media with the given youtube ID
     * @param {*} media_id 
     */
    async startMediaDownload (temp_media_id, on_metadata_cb) {
        console.log(`Starting download of ${temp_media_id}`);
        if (typeof temp_media_id == 'undefined') {
            return;
        }
        
        let metadata_entry = {
            media_id: temp_media_id,
            status: MEDIA_STATUS.STARTING
        }
        
        this.updateMetadataStoreEntry(metadata_entry);
        
        // Keep polling the API until we get download links
        let shouldFetchAPI = true;
        while (shouldFetchAPI && !metadata_entry.stopped) {
            try {
                console.log(`Fetching API ${temp_media_id}`);
                const response = await this.fetchMediaFromAPI(temp_media_id);
                console.log(response);
                const metadata_copy = JSON.parse(JSON.stringify(metadata_entry));
                if (temp_media_id != response.media_id && this.metaData[temp_media_id]) {
                    this.deleteMetadataStoreEntry(metadata_entry); // Delete temp
                }
                
                metadata_entry = {...metadata_copy, ...response};
                console.log(metadata_entry)
                
                if (on_metadata_cb) {
                    on_metadata_cb(metadata_entry);
                    on_metadata_cb = null;
                }
                
                if (response.status == MEDIA_STATUS.COMPLETED) {
                    shouldFetchAPI = false;
                } else if (response.status == MEDIA_STATUS.ERROR) {
                    this.updateMetadataStoreEntry(metadata_entry);
                    return;
                }
                
                this.updateMetadataStoreEntry(metadata_entry);
            } catch (error) {
                console.log(error);
                if (!metadata_entry.title) {
                    this.deleteMetadataStoreEntry(metadata_entry);
                }
                return;
            }
            
            await this.sleep(1000);
        }
        
        if (metadata_entry.stopped) {
            return;
        }
        
        metadata_entry.status = MEDIA_STATUS.COMPLETED;
        this.updateMetadataStoreEntry(metadata_entry);
        
        /*
        metadata_entry.thumbnail
        metadata_entry.video_url
        metadata_entry.audio_url
        */
        
        console.log(`Finished download of ${temp_media_id}`);
        console.log(metadata_entry);
    }
    
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    
    queryMediaFromAPI (media_id) {
        return new Promise((resolve, reject) => {
            fetch(`/api/video`, {
                body: JSON.stringify({
                    media_id: media_id,
                    query: true
                }),
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then(res => res.json())
            .then(res => {
                resolve(res);
            }).catch((error) => {
                reject(error);
            });
        })
    }

    fetchMediaFromAPI (media_id) {
        return new Promise((resolve, reject) => {
            fetch(`/api/video`, {
                body: JSON.stringify({
                    media_id: media_id,
                    dl: true
                }),
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then(res => res.json())
            .then(res => {
                resolve(res);
            }).catch((error) => {
                reject(error);
            });
        })
    }
    
    subscribe (f) {
        return this.metaDataStore.subscribe(f);
    }
}

export const streamManager = new StreamingManager();
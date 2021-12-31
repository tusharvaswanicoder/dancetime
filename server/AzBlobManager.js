import { BlobServiceClient } from '@azure/storage-blob';
import { v1 as uuidv1 } from 'uuid';
import path from 'path';

// use uuidv1() to generate unique file names
const AZURE_STORAGE_CONNECTION_STRING =
    process.env.AZURE_STORAGE_CONNECTION_STRING;

const CONTAINER_TYPE = {
    VIDEO: 'video',
    AUDIO: 'audio',
    CHARTS: 'charts',
    METADATA: 'metadata',
    THUMBNAILS: 'thumbnails'
};

import urljoin from 'url-join';
const DL_BASE_URL = process.env.DL_BASE_URL;

class AzBlobManager {
    constructor() {
        // Create the BlobServiceClient object which will be used to create a container client
        this.blobServiceClient = BlobServiceClient.fromConnectionString(
            AZURE_STORAGE_CONNECTION_STRING
        );

        this.containerClients = {}; // List of all container clients
        
        for (let containerType in CONTAINER_TYPE) {
            const containerName = CONTAINER_TYPE[containerType];
            this.containerClients[containerName] =
                this.blobServiceClient.getContainerClient(containerName);
        }
    }

    /**
     * Returns whether or not a blob exists in a container
     * @param {*} containerName 
     * @param {*} blobName 
     * @returns 
     * 
     * @usage 
        this.blob_exists(CONTAINER_TYPE.VIDEO, 'test.mp4').then((exists) => {
            // exists is a boolean
        })
     */
    async blob_exists(containerName, blobName) {
        const blockBlobClient =
            this.containerClients[containerName].getBlockBlobClient(blobName);
        return blockBlobClient.exists();
    }

    /**
     * Returns the download URL for a blob. Sent to client for them to handle downloading.
     * @param {*} blobName
     * @returns
     */
    get_download_url(containerName, blobName) {
        return urljoin(DL_BASE_URL, containerName, blobName);
    }

    /**
     * Deletes any video/audio blobs that have been alive for more than maxLifetimeMinutes.
     * Not necessary anymore - lifecycle management is handled by rules in az portal.
     * @param {*} maxLifetimeMinutes - Maximum lifetime in minutes to delete video blobs
     */
    async deleteOldVideoAudioBlobs(maxLifetimeMinutes) {
        await this.deleteOldBlobsInIter(this.containerClients[CONTAINER_TYPE.VIDEO].listBlobsFlat(), maxLifetimeMinutes);
        await this.deleteOldBlobsInIter(this.containerClients[CONTAINER_TYPE.AUDIO].listBlobsFlat(), maxLifetimeMinutes);
    }
    
    async deleteOldBlobsInIter(iter, maxLifetimeMinutes) {
        let blobItem = await iter.next();
        while (!blobItem.done) {
            // console.log(`Blob ${i++}: ${blobItem.value.name}`);
            const msLife = new Date() - new Date(blobItem.value.properties.lastModified)
            const minutesLife = msLife / 1000 / 60;
            if (minutesLife > maxLifetimeMinutes) {
                // console.log(`Deleting ${blobItem.value.name}...`);
                await this.deleteVideoBlob(blobItem.value.name);
                // console.log(`Deleted ${blobItem.value.name}.`);
            }
            blobItem = await iter.next();
        }
    }

    /**
     * Downloads and returns a blob as a string. Use JSON.parse to parse into JSON object.
     * @param {*} containerName
     * @param {*} blobName
     * @returns
     */
    async downloadBlob(containerName, blobName) {
        const blockBlobClient =
            this.containerClients[containerName].getBlockBlobClient(blobName);
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        console.log('\nDownloaded blob content...');
        return await this.streamToString(
            downloadBlockBlobResponse.readableStreamBody
        );
    }

    async deleteVideoBlob(blobName) {
        const blockBlobClient =
            this.containerClients[CONTAINER_TYPE.VIDEO].getBlockBlobClient(
                blobName
            );
        return blockBlobClient.deleteIfExists({ deleteSnapshots: 'include' });
    }

    async streamToString(readableStream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on('data', (data) => {
                chunks.push(data.toString());
            });
            readableStream.on('end', () => {
                resolve(chunks.join(''));
            });
            readableStream.on('error', reject);
        });
    }

    /**
     * Uploads a local file as a blob to a container.
     * @param {*} containerName
     * @param {*} blobName
     * @param {*} filePath
     * @param {*} onProgress - Optional function to specify progress of upload. Called with an object with loadedBytes
     */
    async uploadFile(containerName, blobName, filePath, onProgress) {
        const containerClient = this.containerClients[containerName];
        if (!containerClient) {
            throw new Error(`Container ${containerName} does not exist`);
        }

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload data to the blob
        return blockBlobClient.uploadFile(filePath, {
            onProgress: onProgress,
        });
    }

    /**
     * Uploads a blob from a string to a container. Use this for things in memory, like JSON objects.
     * @param {*} containerName
     * @param {*} blobName
     * @param {*} blobContent
     */
    async uploadBlobFromString(containerName, blobName, blobContent) {
        const containerClient = this.containerClients[containerName];
        if (!containerClient) {
            throw new Error(`Container ${containerName} does not exist`);
        }

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload data to the blob
        return await blockBlobClient.upload(blobContent, blobContent.length);
    }
}

const azBlobManager = new AzBlobManager();
export default 
{
    azBlobManager,
    CONTAINER_TYPE
}

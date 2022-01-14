/**
 * Returns the urls of youtube thumbnail
 * @param youtubeURL the youtube url
 * @param thumbnailType the resolution options
 * @returns 
 */
export const getAllYoutubeThumbnailURLs = (youtubeID) => {
    const urls = [];
    const videoId = youtubeID;
    if (!videoId) {
        return null
    }

    const imageTypes = [
        "default.jpg",
        "sddefault.jpg",
        "hqdefault.jpg",
        "mqdefault.jpg",
        "maxresdefault.jpg"
    ]

    let urlTemplate = `https://img.youtube.com/vi/${videoId}/`

    for (let index = 0; index < imageTypes.length; index++) {
        const imageType = imageTypes[index];
        urls.push(urlTemplate + imageType)
    }
    return urls;
}

/**
 * Returns the url of youtube thumbnail by specified resolution type
 * @param youtubeID the youtube id
 * @param resolutionType the resolution options
 * @returns 
 */
export const getYoutubeThumbnailURL = (youtubeID, resolutionType) => {
    const videoId = youtubeID;
    if (!videoId) {
        return null
    }

    let urlTemplate = `https://img.youtube.com/vi/${videoId}/`
    if (resolutionType === "default") {
        return urlTemplate + "default.jpg"
    }
    let imageType = ""
    switch (resolutionType) {
        case "hqdefault":
            imageType = "hqdefault.jpg"
            break;
        case "mqdefault":
            imageType = "mqdefault.jpg"
            break;
        case "sddefault":
            imageType = "sddefault.jpg"
            break;
        case "maxresdefault":
            imageType = "maxresdefault.jpg"
            break;
        default:
            imageType = "default.jpg"
            break;
    }

    return urlTemplate + imageType
}

export const thumbnailIsAvailable = async (thumbailURL) => {
    return new Promise((resolve, reject) => {
        // Must use iframes to check if a page exists cross origin - fetch doesn't work
        const iframe = document.createElement('iframe');
        let iframeError; // Store the iframe timeout
        
        iframe.onload = function () {
            clearTimeout(iframeError);
            iframe.remove();
            resolve(true);
        }
        
        iframeError = setTimeout(function () {
            iframe.remove();
            resolve(false);
        }, 3000);
        
        iframe.src = thumbailURL;
        iframe.style.display = 'none';
        document.getElementsByTagName("body")[0].appendChild(iframe);
    })
}

export const getAvailableThumbnails = async (youtubeURL) => {
    return new Promise((resolve, reject) => {
        const thumbailURLs = getAllYoutubeThumbnailURLs(youtubeURL)
        if (!thumbailURLs) {
            resolve(null);
            return;
        }

        const availableThumbnails = [];
        for (let index = 0; index < thumbailURLs.length; index++) {
            const thumbailURL = thumbailURLs[index];
            thumbnailIsAvailable(thumbailURL).then((isAvailable) => {
                if (isAvailable) {
                    availableThumbnails.push(thumbailURL)
                }
                if (index == thumbailURLs.length - 1) {
                    resolve(availableThumbnails);
                    return;
                }
            })
        }
    })
}
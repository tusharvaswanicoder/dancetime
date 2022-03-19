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
        let imgerr;
        
        const img = new Image();
        img.onload = function() {
            clearTimeout(imgerr);
            img.remove();
            if (!thumbailURL.endsWith('/default.jpg') && this.width == 120) 
            {
                resolve(false);
            } 
            else {
                resolve(true);
            }
        }
        
        img.onerror = function (err) {
            clearTimeout(imgerr);
            img.remove();
            resolve(false);
        }
        
        imgerr = setTimeout(function () {
            img.remove();
            resolve(false);
        }, 5000);
        
        img.src = thumbailURL;
    })
}

export const getAvailableThumbnails = async (youtubeURL) => {
    return new Promise(async (resolve, reject) => {
        const thumbailURLs = getAllYoutubeThumbnailURLs(youtubeURL)
        if (!thumbailURLs) {
            resolve(null);
            return;
        }

        const availableThumbnails = [];
        for (let index = 0; index < thumbailURLs.length; index++) {
            const thumbailURL = thumbailURLs[index];
            if (await thumbnailIsAvailable(thumbailURL))
            {
                availableThumbnails.push(thumbailURL)
            }
        }
        resolve(availableThumbnails);
    })
}

async function fetchHTML (searchQuery) {
    const url = `https://www.youtube.com/results?search_query=${searchQuery}`
    const headers = {
      'User-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0'
    }
    const html = await fetch(url, { headers }).then(response => response.text())
  
    return html
}
  
export async function fetchAnimatedThumbnail (videoId) {
    const html = await fetchHTML(videoId)
    // eslint-disable-next-line
    const pattern = `https:\/\/i\.ytimg\.com\/an_webp\/${videoId}\/mqdefault.+?"`
    const regex = new RegExp(pattern, 'gi')
    const [result] = html.match(regex)
    const clean = result.replace('"', '').replace(/\\u0026/g, '&')
  
    return clean
}
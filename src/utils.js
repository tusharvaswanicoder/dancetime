export const ConvertDurationToNiceString = (duration) => {
    if (!duration) {
        return '--';
    }
    return `${Math.floor(duration / 60)}:${(duration % 60)
        .toString()
        .padStart(2, '0')}`;
};

export const ConvertDurationToNiceStringWithFPS = (duration, fps) => {
    if (!duration || !fps) {
        return '00:00:00';
    }
    const minutes = Math.floor(duration / 60)
        .toFixed(0)
        .toString()
        .padStart(2, '0');
    const seconds = Math.floor(duration % 60)
        .toFixed(0)
        .toString()
        .padStart(2, '0');
    const frames = Math.floor(((duration % 60) % 1) * fps)
        .toFixed(0)
        .toString()
        .padStart(2, '0');

    return `${minutes}:${seconds}:${frames}`;
};

export const GetFrameNumberFromTime = (time, fps) => {
    return Math.floor(time * fps);
}

export const GetTimeFromFrameNumber = (frame, fps) => {
    return frame / fps;
}

export const GetFormattedDate = (_date) => {
    const date = new Date(_date);
    return `${date.toLocaleString('default', {
        month: 'short',
    })} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Returns the keypoints for a specific frame, or an interpolated keyframe set between the closest frames
 * @param {*} keypoints 
 * @param {*} frame 
 */
export const GetKeypointsForFrame = (keypoints, frame) => {

}

// Navigation
export const CreateNavToBeginning = (video, audio, disabled) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    video.currentTime = 0;
    audio.currentTime = 0;
};

export const CreateNavToEnd = (video, audio, disabled) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    video.currentTime = video.duration;
    audio.currentTime = audio.duration;
};

export const CreateNavToPrevFrame = (video, audio, disabled, videoFPS) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    video.pause();
    video.currentTime -= 1 / videoFPS;
    audio.currentTime = video.currentTime;
};

export const CreateNavToNextFrame = (video, audio, disabled, videoFPS) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    video.pause();
    video.currentTime += 1 / videoFPS;
    audio.currentTime = video.currentTime;
};

export const CreatePlayOrPause = (video, audio, disabled) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    audio.currentTime = video.currentTime;
};

// Sizeof object for debugging how large objects are
const typeSizes = {
    undefined: () => 0,
    boolean: () => 4,
    number: () => 8,
    string: (item) => 2 * item.length,
    object: (item) =>
        !item
            ? 0
            : Object.keys(item).reduce(
                (total, key) =>
                    sizeOf(key) + sizeOf(item[key]) + total,
                0
            ),
};

export const sizeOf = (value) => typeSizes[typeof value](value);

export const HasCameraAccess = async () => {
    return new Promise(async (resolve, reject) => {
        const devices = await GetAllVideoDevices();
        resolve(devices.filter((e) => e.label && e.label.length > 0).length > 0);
    })
}

export const RequestCameraAccess = async (device_id) => {
    return new Promise(async (resolve, reject) => {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    deviceId: device_id,
                    width: { min: 1024, ideal: 1280, max: 1920 },
                    height: { min: 576, ideal: 720, max: 1080 }
                }
            })
            .then(function (stream) {
                resolve(stream);
            })
            .catch(function (error) {
                console.log(`Failed to get webcam: ${error}`);
                reject();
            });
    })
}

export const GetAllVideoDevices = async () => {
    return new Promise(async (resolve, reject) => {
        // TIP: once access has been allowed to video devices, all labels are shown :)
        navigator.mediaDevices
            .enumerateDevices()
            .then(function (devices) {
                resolve(devices.filter((e) => e.kind == 'videoinput'));
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
            });
    })
}


/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
 */
export function drawImageProp (ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
    offsetY = typeof offsetY === 'number' ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.videoWidth,
        ih = img.videoHeight,
        r = Math.min(w / iw, h / ih),
        nw = iw * r, // new prop. width
        nh = ih * r, // new prop. height
        cx,
        cy,
        cw,
        ch,
        ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

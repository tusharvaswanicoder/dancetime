import { COMPONENT_TYPE, SONG_WHEEL_CATEGORY_INFO } from './constants';

export const ConvertDurationToNiceString = (duration) => {
    if (!duration) {
        return '--';
    }
    return `${Math.floor(duration / 60)}:${Math.round(duration % 60)
        .toString()
        .padStart(2, '0')}`;
};

export const ConvertDurationToNiceStringWithDecimal = (duration) => {
    if (!duration) {
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
    const decimal = ((duration % 1) * 100)
        .toFixed(0)
        .toString()
        .padStart(2, '0');

    return `${minutes}:${seconds}.${decimal}`;
};

export const GetFormattedDate = (_date) => {
    const date = new Date(_date);
    return `${date.toLocaleString('default', {
        month: 'short',
    })} ${date.getDate()}, ${date.getFullYear()}`;
};

const interp = (a, b, t) => {
    return (b - a) * t + a;
}

/**
 * Returns the keypoints for a specific timestamp, or an interpolated keyframe set between the closest times
 * @param {*} keypoints 
 * @param {*} time 
 */
export const GetKeypointsForTime = (keypoints, time) => {
    
    if (!time || isNaN(time)) {
        return;
    }

    // If there is a matching frame, return it
    if (keypoints[time]) {
        return keypoints[time];
    }
    
    const time_val = parseFloat(time);
    if (!time_val || isNaN(time_val)) {
        return;
    }
    
    const keypoints_values = Object.values(keypoints);
    const keypoints_keys = Object.keys(keypoints).map((v) => parseFloat(v));
    const closest_key = keypoints_keys.reduce((a, b) => {
        return Math.abs(b - time_val) < Math.abs(a - time_val) ? b : a;
    })
    const closest_key_index = keypoints_keys.indexOf(closest_key);

    let start_index, end_index;

    if (time_val - closest_key > 0) {
        // Closest value found is BEFORE the time provided
        start_index = closest_key_index;
        end_index = Math.min(keypoints_keys.length - 1, closest_key_index + 1);
    } else {
        // Closest value found is AFTER the time provided
        end_index = closest_key_index;
        start_index = Math.max(0, closest_key_index - 1);
    }

    // Percentage of interpolation between the two frames we found
    const t = (time_val - keypoints_keys[start_index]) / (keypoints_keys[end_index] - keypoints_keys[start_index]);
    
    const start_keypoints = keypoints_values[start_index];
    const end_keypoints = keypoints_values[end_index];

    if (!start_keypoints.keypoints || !end_keypoints.keypoints) {
        return;
    }
    
    // Interpolate between keypoints
    return {keypoints: start_keypoints.keypoints.map((keypoint) => {
        const matching_end_keypoint = end_keypoints.keypoints.find((_keypoint) => keypoint.name == _keypoint.name);
        
        if (!matching_end_keypoint) {
            console.error(`Failed to find matching keypoint for name ${keypoint.name}`);
            return;
        }
        
        // Interpolate x, y, and score values for each keypoint 
        return {
            x: interp(keypoint.x, matching_end_keypoint.x, t),
            y: interp(keypoint.y, matching_end_keypoint.y, t),
            score: interp(keypoint.score, matching_end_keypoint.score, t),
            name: keypoint.name
        }
    })}
}

// Navigation
export const CreateNavToTime = (time, video, disabled) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    video.seekTo(time, true);
};

export const CreateNavToBeginning = (video, disabled) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    video.seekTo(0, true);
};

export const CreateNavToEnd = async (video, disabled) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    const duration = await video.getDuration();
    video.seekTo(duration, true);
};

export const CreateNavToPrevFrame = async (video, disabled) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    const currentTime = await video.getCurrentTime();
    video.pauseVideo();
    video.seekTo(currentTime - 0.16, true);
};

export const CreateNavToNextFrame = async (video, disabled) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    const currentTime = await video.getCurrentTime();
    video.pauseVideo();
    video.seekTo(currentTime + 0.16, true);
};

export const CreatePlayOrPause = async (video, disabled) => {
    if (!video) {
        return;
    }

    if (disabled) {
        return;
    }

    const state = await video.getPlayerState();
    if (state != 1) {
        video.playVideo();
    } else {
        video.pauseVideo();
    }
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

export const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const GetRoundedTimeFromTime = (time) => {
    return time.toFixed(2);
}

export const GetVideoStartAndEndTimeFromMetadata = (metadata) => {
    const in_out_component = metadata.components.find((component) => component.type == COMPONENT_TYPE.VIDEO_IN_OUT_POINTS);
    return in_out_component ? {start: in_out_component.in, end: in_out_component.out} : {start: 0, end: metadata.duration};
}

export const GetVideoStartTimeFromMetadata = (metadata) => {
    return GetVideoStartAndEndTimeFromMetadata(metadata).start;
}

export const GetVideoEndTimeFromMetadata = (metadata) => {
    return GetVideoStartAndEndTimeFromMetadata(metadata).end;
}

export const getCategoryColorVars = (category) => {
    return `--color1: ${SONG_WHEEL_CATEGORY_INFO[category].colors[0]}; --color2: ${SONG_WHEEL_CATEGORY_INFO[category].colors[1]}`;
}

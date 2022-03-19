import { COMPONENT_TYPE, SONG_WHEEL_CATEGORY_INFO, MAX_PREVIEW_TIME } from './constants';

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
    if (typeof keypoints == 'undefined' || Object.keys(keypoints).length == 0) {
        return;
    }

    if (typeof time == 'undefined' || isNaN(time)) {
        return;
    }

    // If there is a matching frame, return it
    if (keypoints[time]) {
        return keypoints[time];
    }
    
    const time_val = parseFloat(time);
    if (typeof time_val == 'undefined' || isNaN(time_val)) {
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
    if (typeof time == 'undefined' || time == null) {
        return;
    }
    return time.toFixed(2);
}

export const GetVideoStartAndEndTimeFromMetadata = (metadata) => {
    const in_out_component = metadata.components.find((component) => component.type == COMPONENT_TYPE.VIDEO_IN_OUT_POINTS);
    return in_out_component ? {start: in_out_component.in, end: in_out_component.out} : {start: 0, end: metadata.duration};
}

export const GetVideoPreviewTimesFromMetadata = (metadata) => {
    const component = metadata.components.find((component) => component.type == COMPONENT_TYPE.PREVIEW_AREA);
    return component ? {start: component.in, end: component.out} : {start: 0, end: MAX_PREVIEW_TIME};
}

export const GetVideoStartTimeFromMetadata = (metadata) => {
    return GetVideoStartAndEndTimeFromMetadata(metadata).start;
}

export const GetVideoEndTimeFromMetadata = (metadata) => {
    return GetVideoStartAndEndTimeFromMetadata(metadata).end;
}

// Returns the next previous keyframe key from the time given
export const GetScoringZoneEnabledPrevKeyframe = (time, keyframes, ignore_same_time) => {
    if (!keyframes || Object.keys(keyframes).length == 0) {
        return;
    }

    // Find closest keyframe at or before time given
    // If no keyframe exists, assume scoring is enabled

    const time_val = parseFloat(time);
    if (typeof time_val == 'undefined' || isNaN(time_val)) {
        return;
    }

    if (time == 0) {
        return;
    }

    if (!ignore_same_time && keyframes[time]) {
        return GetRoundedTimeFromTime(time_val);
    }
    
    const keyframes_keys = Object.keys(keyframes).map((v) => parseFloat(v));
    const closest_key_before = keyframes_keys.reduce((a, b) => {
        if (ignore_same_time) {
            if (typeof a == 'undefined') {
                return b == time_val ? undefined : b;
            } else if (typeof b == 'undefined') {
                return a == time_val ? undefined : a;
            }
        } else {
            if (typeof a == 'undefined') {
                return b;
            } else if (typeof b == 'undefined') {
                return a;
            }
        }

        const a_diff = a - time_val;
        const b_diff = b - time_val;

        if (a_diff > 0 && b_diff > 0) {
            return;
        }

        if (ignore_same_time) {
            if (a == time_val) {
                return b;
            } else if (b == time_val) {
                return a;
            }
        }

        // Return value with lowest negative difference
        if (a_diff < 0 && b_diff < 0) {
            return a_diff > b_diff ? a : b;
        } else if (a_diff > 0 && b_diff < 0) {
            return b;
        } else if (a_diff < 0 && b_diff > 0) {
            return a;
        }
    })
    return GetRoundedTimeFromTime(closest_key_before);
}

// Returns the next closest keyframe key from the time given
export const GetScoringZoneEnabledNextKeyframe = (time, keyframes, ignore_same_time) => {
    if (!keyframes || Object.keys(keyframes).length == 0) {
        return;
    }

    // Find closest keyframe at or before time given
    // If no keyframe exists, assume scoring is enabled

    const time_val = parseFloat(time);
    if (typeof time_val == 'undefined' || isNaN(time_val)) {
        return;
    }

    if (!ignore_same_time && keyframes[time]) {
        return GetRoundedTimeFromTime(time_val);
    }
    
    const keyframes_keys = Object.keys(keyframes).map((v) => parseFloat(v));
    const closest_key_after = keyframes_keys.reduce((a, b) => {
        if (ignore_same_time) {
            if (typeof a == 'undefined') {
                return b == time_val ? undefined : b;
            } else if (typeof b == 'undefined') {
                return a == time_val ? undefined : a;
            }
        } else {
            if (typeof a == 'undefined') {
                return b;
            } else if (typeof b == 'undefined') {
                return a;
            }
        }

        const a_diff = a - time_val;
        const b_diff = b - time_val;

        if (a_diff < 0 && b_diff < 0) {
            return;
        }

        if (ignore_same_time) {
            if (a == time_val) {
                return b_diff > 0 ? b : null;
            } else if (b == time_val) {
                return a_diff > 0 ? a : null;
            }
        }

        // Return value with lowest positive difference
        if (a_diff > 0 && b_diff < 0) {
            return a;
        } else if (a_diff < 0 && b_diff > 0) {
            return b;
        } else if (a_diff > 0 && b_diff > 0) {
            return a_diff < b_diff ? a : b;
        }
    })
    return GetRoundedTimeFromTime(closest_key_after);
}

export const GetScoringZoneEnabledAtTime = (time, keyframes) => {
    if (Object.keys(keyframes).length == 0) {
        return true;
    }
    
    const key = GetScoringZoneEnabledPrevKeyframe(time, keyframes);
    if (key) {
        return keyframes[key];
    }

    return true;
}

export const getCategoryColorVars = (category) => {
    return `--color1: ${SONG_WHEEL_CATEGORY_INFO[category].colors[0]}; --color2: ${SONG_WHEEL_CATEGORY_INFO[category].colors[1]}`;
}

// Mirrors the X values of keypoints
// Assumes X keypoints are in the 0-1920 range
// Expects keypoints to look like:
/*
keypoints: {
    ["0.00"]: {
        keypoints: [
            {x: 57, y: 57, score: 0.3},
            {x: 57, y: 57, score: 0.3},
        ]
    },
    ["2.30"]: {
        keypoints: [
            {x: 57, y: 57, score: 0.3},
            {x: 57, y: 57, score: 0.3},
        ]
    },
}
*/

import { SortKeypointsByName } from './Ingame/Scoring/KeypointGroupSplits';

export const MirrorKeypoints = (keypoints) => {
    // Mirror keypoints horizontally so no post processing is needed for the webcam feed later
    const mirrored_keypoints = {};
    for (const timestamp in keypoints) {
        mirrored_keypoints[timestamp] = {
            ...keypoints[timestamp],
            keypoints: SortKeypointsByName(keypoints[timestamp].keypoints.map((keypoint) => {
                return {
                    ...keypoint,
                    x: 1920 - keypoint.x,
                    name: keypoint.name.includes('right') ? 
                        keypoint.name.replace('right', 'left') :
                        keypoint.name.replace('left', 'right')
                }
            }))
        }
    }
    
    return mirrored_keypoints;
}

export const GetRelativeTimeFormat = (date) => {
    const rtf1 = new Intl.RelativeTimeFormat('en', { style: 'long' });
    const then = new Date(date);
    const now = new Date();
    const diff_in_seconds = (now.getTime() -  then.getTime()) / 1000;
    const diff_in_minutes = diff_in_seconds / 60;
    const diff_in_hours = diff_in_minutes / 60;
    const diff_in_days = diff_in_hours / 24;
    const diff_in_weeks = diff_in_days / 7;
    const diff_in_months = diff_in_weeks / 4;
    const diff_in_years = diff_in_months / 12;
    
    if (diff_in_seconds < 60)
    {
        return rtf1.format(-Math.floor(diff_in_seconds), 'second');
    }
    else if (diff_in_minutes < 60)
    {
        return rtf1.format(-Math.floor(diff_in_minutes), 'minute');
    }
    else if (diff_in_hours < 24)
    {
        return rtf1.format(-Math.floor(diff_in_hours), 'hour');
    }
    else if (diff_in_weeks < 4)
    {
        return rtf1.format(-Math.floor(diff_in_weeks), 'week');
    }
    else if (diff_in_months < 12)
    {
        return rtf1.format(-Math.floor(diff_in_months), 'month');
    }
    else
    {
        return then.toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"});
    }
}
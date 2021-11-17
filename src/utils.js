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

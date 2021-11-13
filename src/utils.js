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

export const GetFormattedDate = (_date) => {
    const date = new Date(_date);
    return `${date.toLocaleString('default', {
        month: 'short',
    })} ${date.getDate()}, ${date.getFullYear()}`;
};

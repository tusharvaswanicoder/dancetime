import { GROUP_TYPE } from './KeypointGroupSplits';

// Accuracy scores must be above this to even be scored
export const DEFAULT_ACCURACY_SCORE_THRESHOLD = 0.4;

// Amount of frames to lookback and average scores over to the the "current" frame's score
export const DEFAULT_SCORE_AVG_FRAME_LOOKBACK = () => {
    return 0.5;
};

// Default weighting for each group. Scores are averaged based on these weights - should add to 1
export const DEFAULT_GROUP_WEIGHTS = {
    // [GROUP_TYPE.Head]: 0,
    [GROUP_TYPE.Torso]: 0.50,
    [GROUP_TYPE.Legs]: 0.50,
};

// Scoring for each group type.
// Anything below the minimum will result in a 0 and scales up to max from there.
// Anything above max is a perfect score (100)
export const DEFAULT_GROUP_SCORE_THRESHOLDS = {
    // [GROUP_TYPE.Head]: { min: 0.6, max: 0.90 },
    [GROUP_TYPE.Torso]: { min: 0.7, max: 0.95 },
    [GROUP_TYPE.Legs]: { min: 0.7, max: 0.95 },
};

// Default score scaling function - linear, cubic, etc. Scales differently between the min and max values
// Returns a value between 0 and 1 that represents the scaled score
export const DEFAULT_SCORE_SCALING_FUNCTION = (_value, _min, _max) => {
    const value = _value - _min;

    // Value below cutoff
    if (value <= 0) {
        return 0;
    }

    const max = _max - _min;

    // Value above max
    if (value >= max) {
        return 1;
    }

    const score_percentage = value / max;

    return Math.min(1, Math.pow(score_percentage, 1.2) + score_percentage / 10);
};

export const GROUP_SCORE_TIME_LOOKBACK = () => {
    return 0.5;
};

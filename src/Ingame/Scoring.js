import { GROUP_TYPE } from '../tensorflow/KeypointGroupSplits';

// Accuracy scores must be above this to even be scored
export const DEFAULT_ACCURACY_SCORE_THRESHOLD = 0.5;

// Default weighting for each group. Scores are averaged based on these weights - should add to 1
export const DEFAULT_GROUP_WEIGHTS = {
    [GROUP_TYPE.Head]: 0.1,
    [GROUP_TYPE.Torso]: 0.45,
    [GROUP_TYPE.Legs]: 0.45
}

// Scoring for each group type.
// Anything below the minimum will result in a 0 and scales up to max from there.
// Anything above max is a perfect score (100)
export const DEFAULT_GROUP_SCORE_THRESHOLDS = {
    [GROUP_TYPE.Head]: {min: 0.5, max: 0.95},
    [GROUP_TYPE.Torso]: {min: 0.6, max: 0.95},
    [GROUP_TYPE.Legs]: {min: 0.6, max: 0.95}
}

// Default score scaling function - linear, cubic, etc. Scales differently between the min and max values
// Returns a value between 0 and 1 that represents the scaled score
const DEFAULT_SCORE_SCALING_FUNCTION = (_value, _min, _max) => {
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
    
    return Math.pow(score_percentage, 0.4);
}

/**
 * Given an object with score groups and group weights, returns an overall averaged score between 0 - 100
 * @param {*} score_groups 
 * @param {*} group_weights 
 * 
 * score_groups might look like this:
 * score_groups = {
    [GROUP_TYPE.Head]: 0.95213223,
    [GROUP_TYPE.Torso]: 0.921232312,
    [GROUP_TYPE.Legs]: 0.87978421
}
 * group_weights is an object like DEFAULT_GROUP_WEIGHTS. DEFAULT_GROUP_WEIGHTS will be used if none is provided
 */
export const GetScoreFromGroups = (score_groups, group_weights) => {
    const adjusted_score_groups = {};
    const weights = group_weights || DEFAULT_GROUP_WEIGHTS;
    
    let overall_score = 0;
    for (const [group_name, score] of Object.entries(score_groups)) {
        const thresholds = DEFAULT_GROUP_SCORE_THRESHOLDS[group_name];
        adjusted_score_groups[group_name] = DEFAULT_SCORE_SCALING_FUNCTION(score, thresholds.min, thresholds.max);
        overall_score += adjusted_score_groups[group_name] * weights[group_name];
    }
    
    if (overall_score < 0 || overall_score > 1) {
        console.error(`Scoring error: out of bounds (${overall_score})`);
    }

    return {
        overall: overall_score,
        groups: adjusted_score_groups
    }
}
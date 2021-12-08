import {
    DEFAULT_SCORE_SCALING_FUNCTION,
    DEFAULT_GROUP_SCORE_THRESHOLDS,
    DEFAULT_GROUP_WEIGHTS,
} from './Defaults';

/**
 * Given an object with score groups and group weights, returns an overall averaged score between 0 - 1
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
        if (thresholds) {
            adjusted_score_groups[group_name] = DEFAULT_SCORE_SCALING_FUNCTION(
                score,
                thresholds.min,
                thresholds.max
            );
            overall_score +=
                adjusted_score_groups[group_name] * weights[group_name];
        }
    }

    if (overall_score < 0 || overall_score > 1) {
        console.error(`Scoring error: out of bounds (${overall_score})`);
    }

    return {
        overall: overall_score,
        groups: adjusted_score_groups
    };
};

import { GROUP_TYPE } from '../tensorflow/KeypointGroupSplits';

// Accuracy scores must be above this to even be scored
export const DEFAULT_ACCURACY_SCORE_THRESHOLD = 0.5;

// Amount of frames to lookback and average scores over to the the "current" frame's score
export const DEFAULT_SCORE_AVG_FRAME_LOOKBACK = (fps) => {
    return fps * 2;
}

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
    [GROUP_TYPE.Head]: {min: 0.6, max: 0.97},
    [GROUP_TYPE.Torso]: {min: 0.7, max: 0.97},
    [GROUP_TYPE.Legs]: {min: 0.7, max: 0.97}
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
    
    return Math.pow(score_percentage, 1);
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

// TODO: try only filtering out outliers based on the average of last X scores in case there was an analysis error

// Returns the current score averaged over the past X frames, only taking the avg of top 5 scores in that group
const NUM_TOP_SCORES = 5;

// Outliers are below (1 - this) * top score and are not used in average calculation
// TODO: consider making this use the average and also get rid of very high outliers?
const OUTLIER_THRESHOLD = 0.1;
export const GetCurrentTopXLastScores = (all_scores, current_frame, fps, num_scores) => {
    const num_scores_to_lookat = num_scores || NUM_TOP_SCORES;
    const num_frames_to_lookback = DEFAULT_SCORE_AVG_FRAME_LOOKBACK(fps);
    
    const last_scores = [];
    // TODO: optimize with a stack and store last X frame scores in memory or somethign to avoid this loop every time
    for (let frame = current_frame; frame > current_frame - num_frames_to_lookback && frame > 0; frame--) {
        const frame_score = all_scores[frame];
        
        if (frame_score) {
            last_scores.push(frame_score.overall);
        }
    }
    
    // Get average of top X scores in the last X frames
    const top_5_scores = last_scores.sort((a,b) => b - a).slice(0, num_scores_to_lookat);
    const top_score_threshold = top_5_scores[0] * (1 - OUTLIER_THRESHOLD);
    const top_x_scores_no_outliers = top_5_scores.filter((s) => s > top_score_threshold);
    return top_x_scores_no_outliers.reduce((a, b) => a + b) / top_x_scores_no_outliers.length;
}

// Returns the current score averaged over the past X frames (instead of instantaneous on each frame)
export const GetCurrentAvgScore = (all_scores, current_frame, fps) => {
    let score_total = 0;
    let num_scores = 0;
    
    const num_frames_to_lookback = DEFAULT_SCORE_AVG_FRAME_LOOKBACK(fps);
    
    // TODO: optimize with a stack
    for (let frame = current_frame; frame > current_frame - num_frames_to_lookback && frame > 0; frame--) {
        const frame_score = all_scores[frame];
        
        if (frame_score) {
            score_total += frame_score.overall;
            num_scores++;
        }
    }
    
    return score_total / num_scores;
}

export const JUDGEMENTS = {
    PERFECT: 1,
    BEAUTIFUL: 2,
    MARVELOUS: 3,
    AWESOME: 4,
    FANTASTIC: 5,
    SUPER: 6,
    GREAT: 7,
    GOOD: 8,
    OK: 9,
    ALMOST: 10,
    WAY_OFF: 11,
    BOO: 12,
    MISS: 13
}

// Frequency at which judgements are shown
export const JUDGEMENT_VISUAL_FREQUENCY = 0.5;

// Visual data for judgements
export const JUDGEMENT_VISUALS = {
    [JUDGEMENTS.PERFECT]:       {name: 'Perfect',   color: 'hsla(61, 100%, 50%, 1)'},
    [JUDGEMENTS.BEAUTIFUL]:     {name: 'Beautiful', color: 'hsla(94, 100%, 55%, 1)'},
    [JUDGEMENTS.MARVELOUS]:     {name: 'Marvelous', color: 'hsla(135, 100%, 62%, 1)'},
    [JUDGEMENTS.AWESOME]:       {name: 'Awesome',   color: 'hsla(166, 100%, 58%, 1)'},
    [JUDGEMENTS.FANTASTIC]:     {name: 'Fantastic', color: 'hsla(164, 79%, 58%, 1)'},
    [JUDGEMENTS.SUPER]:         {name: 'Super',     color: 'hsla(180, 62%, 59%, 1)'},
    [JUDGEMENTS.GREAT]:         {name: 'Great',     color: 'hsla(207, 80%, 63%, 1)'},
    [JUDGEMENTS.GOOD]:          {name: 'Good',      color: 'hsla(236, 98%, 61%, 1)'},
    [JUDGEMENTS.OK]:            {name: 'Ok',        color: 'hsla(269, 78%, 56%, 1)'},
    [JUDGEMENTS.ALMOST]:        {name: 'Almost',    color: 'hsla(303, 71%, 53%, 1)'},
    [JUDGEMENTS.WAY_OFF]:       {name: 'Way Off',   color: 'hsla(325, 95%, 56%, 1)'},
    [JUDGEMENTS.BOO]:           {name: 'Boo',       color: 'hsla(342, 97%, 55%, 1)'},
    [JUDGEMENTS.MISS]:          {name: 'Miss',      color: 'hsla(360, 100%, 58%, 1)'}
}

// Score must be greater than or equal to these values to get the judgement
export const JUDGEMENT_VALUES = {
    [JUDGEMENTS.PERFECT]:       0.95,
    [JUDGEMENTS.BEAUTIFUL]:     0.93,
    [JUDGEMENTS.MARVELOUS]:     0.90,
    [JUDGEMENTS.AWESOME]:       0.88,
    [JUDGEMENTS.FANTASTIC]:     0.85,
    [JUDGEMENTS.SUPER]:         0.83,
    [JUDGEMENTS.GREAT]:         0.80,
    [JUDGEMENTS.GOOD]:          0.75,
    [JUDGEMENTS.OK]:            0.70,
    [JUDGEMENTS.ALMOST]:        0.65,
    [JUDGEMENTS.WAY_OFF]:       0.60,
    [JUDGEMENTS.BOO]:           0.50,
    [JUDGEMENTS.MISS]:          0.00
}

export const GetJudgementFromScore = (score) => {
    for (const [judgement, cutoff_score] of Object.entries(JUDGEMENT_VALUES)) {
        if (score >= cutoff_score) {
            return judgement;
        }
    }
    
    return JUDGEMENTS.MISS;
}
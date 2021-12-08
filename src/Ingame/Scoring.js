import { shapeSimilarity } from 'curve-matcher';
import { GetKeypointsForFrame, GetFrameNumberFromTime } from '../utils';
import {
    testIngameScores,
    ingameRawScores,
    ingameCurrentJudgement,
    ingameJudgementTotals,
    ingameAdjustedScores,
    ingameRawJudgements
} from '../stores';
import { SplitPoseByGroupXY, GROUP_TYPE } from '../tensorflow/KeypointGroupSplits';
import outlier from './RemoveOutliers';

// Accuracy scores must be above this to even be scored
export const DEFAULT_ACCURACY_SCORE_THRESHOLD = 0.5;

// Amount of frames to lookback and average scores over to the the "current" frame's score
export const DEFAULT_SCORE_AVG_FRAME_LOOKBACK = (fps) => {
    return fps;
};

// Default weighting for each group. Scores are averaged based on these weights - should add to 1
export const DEFAULT_GROUP_WEIGHTS = {
    [GROUP_TYPE.Head]: 0.05,
    [GROUP_TYPE.Torso]: 0.50,
    [GROUP_TYPE.Legs]: 0.45,
};

// Scoring for each group type.
// Anything below the minimum will result in a 0 and scales up to max from there.
// Anything above max is a perfect score (100)
export const DEFAULT_GROUP_SCORE_THRESHOLDS = {
    [GROUP_TYPE.Head]: { min: 0.6, max: 0.90 },
    [GROUP_TYPE.Torso]: { min: 0.7, max: 0.95 },
    [GROUP_TYPE.Legs]: { min: 0.7, max: 0.95 },
};

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

    return Math.pow(score_percentage, 0.3);
};

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
        adjusted_score_groups[group_name] = DEFAULT_SCORE_SCALING_FUNCTION(
            score,
            thresholds.min,
            thresholds.max
        );
        overall_score +=
            adjusted_score_groups[group_name] * weights[group_name];
    }

    if (overall_score < 0 || overall_score > 1) {
        console.error(`Scoring error: out of bounds (${overall_score})`);
    }

    return {
        overall: overall_score,
        groups: adjusted_score_groups,
    };
};

// TODO: try only filtering out outliers based on the average of last X scores in case there was an analysis error

// Returns the current score averaged over the past X frames, only taking the avg of top 5 scores in that group
const NUM_TOP_SCORES = 5;

// Outliers are below (1 - this) * top score and are not used in average calculation
// TODO: consider making this use the average and also get rid of very high outliers?
const OUTLIER_THRESHOLD = 0.1;
export const GetCurrentTopXLastScores = (
    all_scores,
    current_frame,
    fps,
    num_scores
) => {
    const num_scores_to_lookat = num_scores || NUM_TOP_SCORES;
    const num_frames_to_lookback = DEFAULT_SCORE_AVG_FRAME_LOOKBACK(fps);

    const last_scores = [];
    // TODO: optimize with a stack and store last X frame scores in memory or something to avoid this loop every time
    for (
        let frame = current_frame;
        frame > current_frame - num_frames_to_lookback && frame > 0;
        frame--
    ) {
        const frame_score = all_scores[frame];

        if (frame_score) {
            last_scores.push(frame_score.overall);
        }
    }

    const outliers = outlier(last_scores).findOutliers();
    
    // Remove outliers from all_similarity_scores
    if (outliers.length > 0) {
        for (const index in last_scores) {
            const score = last_scores[index];
            if (outliers.includes(score)) {
                last_scores[index] = null;
            }
        }
    }
    
    const last_scores_no_outliers = last_scores.filter((s) => s != null);
    
    // Get average of top X scores in the last X frames
    // const top_5_scores = last_scores
    //     .sort((a, b) => b - a)
    //     .slice(0, num_scores_to_lookat);
    // const top_score_threshold = top_5_scores[0] * (1 - OUTLIER_THRESHOLD);
    // const last_scores_no_outliers = last_scores.filter(
    //     (s) => s > top_score_threshold
    // );

    if (last_scores_no_outliers.length == 0) {
        console.warn('No top x scores found');
        return 0;
    }

    return (
        last_scores_no_outliers.reduce((a, b) => a + b) /
        last_scores_no_outliers.length
    );
};

// Returns the current judgement for a judgement index taking the top judgement from the past period
export const GetCurrentTopJudgementFromPastPeriod = (all_judgements, current_frame, fps) => {
    const num_frames_to_lookback = Math.ceil(fps * JUDGEMENT_VISUAL_FREQUENCY);

    const last_judgements = [];
    for (
        let frame = current_frame;
        frame > current_frame - num_frames_to_lookback && frame > 0;
        frame--
    ) {
        const frame_judgement = all_judgements[frame];

        if (frame_judgement) {
            last_judgements.push(frame_judgement);
        }
    }

    // Get average of top X scores in the last X frames
    return last_judgements.sort((a, b) => b - a)[0];
}

// Returns the current score averaged over the past X frames (instead of instantaneous on each frame)
export const GetCurrentAvgScore = (all_scores, current_frame, fps) => {
    let score_total = 0;
    let num_scores = 0;

    const num_frames_to_lookback = DEFAULT_SCORE_AVG_FRAME_LOOKBACK(fps);

    // TODO: optimize with a stack
    for (
        let frame = current_frame;
        frame > current_frame - num_frames_to_lookback && frame > 0;
        frame--
    ) {
        const frame_score = all_scores[frame];

        if (frame_score) {
            score_total += frame_score.overall;
            num_scores++;
        }
    }

    return score_total / num_scores;
};

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
    MISS: 13,
};

// Frequency at which judgements are shown
export const JUDGEMENT_VISUAL_FREQUENCY = 0.5;

// Visual data for judgements
export const JUDGEMENT_VISUALS = {
    [JUDGEMENTS.PERFECT]: { name: 'Perfect', color: 'hsla(54, 100%, 50%, 1)' },
    [JUDGEMENTS.MARVELOUS]: {
        name: 'Marvelous',
        color: 'hsla(175, 100%, 58%, 1)',
    },
    [JUDGEMENTS.GREAT]: { name: 'Great', color: 'hsla(135, 100%, 54%, 1)' },
    [JUDGEMENTS.GOOD]: { name: 'Good', color: 'hsla(236, 98%, 61%, 1)' },
    [JUDGEMENTS.ALMOST]: { name: 'Almost', color: 'hsla(313, 100%, 51%, 1)' },
    [JUDGEMENTS.MISS]: { name: 'Miss', color: 'hsla(360, 100%, 58%, 1)' },
};

// Score must be greater than or equal to these values to get the judgement
export const JUDGEMENT_CUTOFFS = {
    [JUDGEMENTS.PERFECT]: 0.95,
    [JUDGEMENTS.MARVELOUS]: 0.90,
    [JUDGEMENTS.GREAT]: 0.80,
    [JUDGEMENTS.GOOD]: 0.70,
    [JUDGEMENTS.ALMOST]: 0.60,
    [JUDGEMENTS.MISS]: 0.0,
};

export const JUDGEMENT_SCORE_VALUES = {
    [JUDGEMENTS.PERFECT]: 5,
    [JUDGEMENTS.MARVELOUS]: 4,
    [JUDGEMENTS.GREAT]: 3,
    [JUDGEMENTS.GOOD]: 2,
    [JUDGEMENTS.ALMOST]: 1,
    [JUDGEMENTS.MISS]: 0,
};

export const GetTotalFinalScore = (judgement_list) => {
    const values = Object.values(judgement_list);
    let total = 0;
    
    for (const judgement of values) {
        total += JUDGEMENT_SCORE_VALUES[judgement];
    }
    
    const perfects = Object.values(judgement_list).filter((v) => v == JUDGEMENTS.PERFECT);
    console.log(`Perfect percent: ${perfects.length / values.length}`)
    
    return total / (values.length * JUDGEMENT_SCORE_VALUES[JUDGEMENTS.PERFECT]) * 100;
}

export const GetPerfectPercentage = (judgement_list) => {
    // Not accurate - use other list or something because this list keeps growing
    // Get 
    const values = Object.values(judgement_list);
    const perfects = Object.values(judgement_list).filter((v) => v == JUDGEMENTS.PERFECT);
    return perfects.length / values.length;
}

export const GetJudgementFromScore = (score) => {
    for (const [judgement, cutoff_score] of Object.entries(JUDGEMENT_CUTOFFS)) {
        if (score >= cutoff_score) {
            return judgement;
        }
    }

    return JUDGEMENTS.MISS;
};

const SHAPE_SIMILARITY_OPTIONS = {
    ['restrictRotationAngle']: 0.05 * Math.PI,
    ['estimationPoints']: 30,
    ['rotations']: 10,
};

// Interval at which judgements are given/stored
export const JUDGEMENT_INTERVAL = 0.5;

const GetCurrentJudgementIndex = (currentTime) => {
    return Math.floor(currentTime / JUDGEMENT_INTERVAL);
}

const GROUP_SCORE_FRAME_LOOKBACK = (fps) => {
    return Math.ceil(fps / 2);
};

// Compares the current frame group scores to the past X frames group scores and returns the averge similarities no outliers
const GetAvgGroupScoresWithFrameLookbackNoOutliers = (
    groups,
    current_frame,
    playGameMetadataValue
) => {
    // Find and remove outliers then take the average of all similarity scores in the past X frames
    const lookback_frame_amount = GROUP_SCORE_FRAME_LOOKBACK(
        playGameMetadataValue.fps
    );

    const GetAvgGroupScore = (group) => {
        const values = Object.values(group);
        return values.reduce((a, b) => a + b) / values.length;
    };

    // let largest_avg_group_score = 0;
    // let best_group_scores;
    
    let all_similarity_scores = [];
    const all_avg_group_scores = [];

    for (
        let frame = current_frame;
        frame > current_frame - lookback_frame_amount && frame > 0;
        frame--
    ) {
        const videoFrameKeypoints = GetKeypointsForFrame(
            playGameMetadataValue.keypoints,
            frame
        );

        if (videoFrameKeypoints && videoFrameKeypoints.keypoints) {
            const model_groups = SplitPoseByGroupXY(
                videoFrameKeypoints.keypoints
            );
            const group_scores = ShapeSimilarityGroups(groups, model_groups);
            all_similarity_scores.push(group_scores);
            const avg_group_score = GetAvgGroupScore(group_scores) || 0;
            all_avg_group_scores.push(avg_group_score);
        }
    }
    
    const outliers = outlier(all_avg_group_scores).findOutliers();
    
    // Remove outliers from all_similarity_scores
    if (outliers.length > 0) {
        for (const index in all_avg_group_scores) {
            const avg_score = all_avg_group_scores[index];
            if (outliers.includes(avg_score)) {
                all_similarity_scores[index] = null;
            }
        }
    }
    
    // Filter out outliers
    all_similarity_scores = all_similarity_scores.filter((v) => v != null);
    
    // Using all_similarity_scores, compute average similarity scores
    const averaged_group_scores = {
        [GROUP_TYPE.Head]: 0,
        [GROUP_TYPE.Torso]: 0,
        [GROUP_TYPE.Legs]: 0
    }

    // Sum up all scores
    for (const score of all_similarity_scores) {
        for (const group_type of Object.values(GROUP_TYPE)) {
            averaged_group_scores[group_type] += score[group_type];
        }
    }
    
    // TODO: don't get average, but instead take top score that's not an outlier
    // Average is too inconsistent
    // Divide to get average
    for (const group_type of Object.values(GROUP_TYPE)) {
        averaged_group_scores[group_type] /= all_similarity_scores.length;
    }
    
    return averaged_group_scores;
};

const ShapeSimilarityGroups = (groups, model_groups) => {
    const group_scores = {};
    for (const group_name in groups) {
        // TODO: add frame lookback ~15 frames or so to get highest score with past 15 frames
        const similarity = shapeSimilarity(
            model_groups[group_name],
            groups[group_name],
            SHAPE_SIMILARITY_OPTIONS
        );

        group_scores[group_name] = similarity;
    }
    return group_scores;
};

const STAR_SCORE_CUTOFFS = {
    [4]: 0.8,
    [3]: 0.6,
    [2]: 0.4,
    [1]: 0.2
}

export const GetNumStarsFromPerfectPercentage = (percentage) => {
    for (const [num_stars, cutoff_score] of Object.entries(STAR_SCORE_CUTOFFS)) {
        if (percentage >= cutoff_score) {
            return num_stars;
        }
    }
    
    return 0;
}

// Every frame starts here
export const AnalyzePose = async (
    pose,
    currentTime,
    playGameMetadataValue,
    ingameRawScoresValue,
    ingameAdjustedScoresValue,
    ingameJudgementTotalsValue,
    ingameRawJudgementsValue
) => {
    // If this function returns early, the score given for that frame is 0
    if (!pose || !pose.keypoints) {
        return;
    }

    if (pose.score < DEFAULT_ACCURACY_SCORE_THRESHOLD) {
        return;
    }
    
    const frame = GetFrameNumberFromTime(currentTime, playGameMetadataValue.fps);
    
    const groups = SplitPoseByGroupXY(pose.keypoints);
    const group_scores = GetAvgGroupScoresWithFrameLookbackNoOutliers(
        groups,
        frame,
        playGameMetadataValue
    );
    if (!group_scores) {
        return;
    }

    const raw_score = GetScoreFromGroups(group_scores);
    ingameRawScoresValue[frame] = raw_score;
    ingameRawScores.set(ingameRawScoresValue);

    const thisFrameScore = GetCurrentTopXLastScores(
        ingameRawScoresValue,
        frame,
        playGameMetadataValue.fps
    );
    
    ingameAdjustedScoresValue[frame] = thisFrameScore;
    ingameAdjustedScores.set(ingameAdjustedScoresValue);
    
    let scoresString = `${thisFrameScore.toFixed(2)}`;

    for (const group_name in raw_score.groups) {
        scoresString += `   ${group_name}: ${raw_score.groups[group_name].toFixed(
            2
        )}`;
    }

    const judgement = GetJudgementFromScore(thisFrameScore);
    ingameRawJudgementsValue[frame] = judgement;
    ingameRawJudgements.set(ingameRawJudgementsValue);
    
    scoresString += ` -- ${JUDGEMENT_VISUALS[judgement].name}`;

    testIngameScores.set(scoresString);
    
    // Update current judgement and judgement values if needed
    const judgement_index = GetCurrentJudgementIndex(currentTime);
    if (!ingameJudgementTotalsValue[judgement_index]) {
        const top_judgement = GetCurrentTopJudgementFromPastPeriod(ingameRawJudgementsValue, frame, playGameMetadataValue.fps);
        ingameJudgementTotalsValue[judgement_index] = top_judgement;
        ingameJudgementTotals.set(ingameJudgementTotalsValue)
        ingameCurrentJudgement.set(top_judgement);
    }
};

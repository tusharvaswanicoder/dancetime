import { shapeSimilarity } from 'curve-matcher';
import { GetKeypointsForFrame } from '../../utils';
import { SplitPoseByGroupXY, GROUP_TYPE } from './KeypointGroupSplits';
import { DEFAULT_GROUP_WEIGHTS, GROUP_SCORE_FRAME_LOOKBACK } from './Defaults';
import outlier from './RemoveOutliers';

const SHAPE_SIMILARITY_OPTIONS = {
    ['restrictRotationAngle']: 0.05 * Math.PI,
    ['estimationPoints']: 30,
    ['rotations']: 10,
};

/////////////////////// COMMON

/**
 * 
 * @param {*} groups : An array of:
 * {
 *      [GROUP_TYPE.HEAD]: 0.2323,
 *      [GROUP_TYPE.TORSO]: 0.5352,
 *      [GROUP_TYPE.LEGS]: 0.32643,
 * }
 * @returns 
 */
const GetWeightedAvgGroupsScores = (groups) => {
    return groups.map((group) => {
        return GetWeightedAvgGroupScore(group);
    })
}

/**
 * Returns the average of the scores in the group, based on weights from DEFAULT_GROUP_WEIGHTS
 * @param {*} group : 
 * {
 *      [GROUP_TYPE.HEAD]: 0.2323,
 *      [GROUP_TYPE.TORSO]: 0.5352,
 *      [GROUP_TYPE.LEGS]: 0.32643,
 * }
 * @returns 
 */
const GetWeightedAvgGroupScore = (group) => {
    let total = 0;
    for (const [group_type, value] of Object.entries(group)) {
        const weight = DEFAULT_GROUP_WEIGHTS[group_type];
        if (weight) {
            total += value * weight;
        }
    }
    
    return total;
};

// Returns all the similarity scores for the past X frames in an array
const GetShapeSimilarityWithLookback = (groups, current_frame, playGameMetadataValue) => {
    const lookback_frame_amount = GROUP_SCORE_FRAME_LOOKBACK(playGameMetadataValue.fps);
    let all_similarity_scores = [];

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
            const model_groups = SplitPoseByGroupXY(videoFrameKeypoints.keypoints);
            const group_scores = ShapeSimilarityGroups(groups, model_groups);
            all_similarity_scores.push(group_scores);
        }
    }
    
    return all_similarity_scores;
}

// Removes and returns outliers from similarity scores using weighted avg scores
const RemoveWeightedAvgOutliers = (all_similarity_scores, all_weighted_avg_scores) => {
    const outliers = outlier(all_weighted_avg_scores).findOutliers();
    
    // Remove outliers from all_similarity_scores
    if (outliers.length > 0) {
        for (const index in all_weighted_avg_scores) {
            const avg_score = all_weighted_avg_scores[index];
            if (outliers.includes(avg_score)) {
                all_similarity_scores[index] = null;
            }
        }
    }
    
    // Filter out outliers
    return all_similarity_scores.filter((v) => v != null);
}

// Performs shape similarity comparison on two groups with keypoints in them
// See SplitPoseByGroupXY for group split format
const ShapeSimilarityGroups = (groups, model_groups) => {
    const group_scores = {};
    for (const group_name in groups) {
        const similarity = shapeSimilarity(
            model_groups[group_name],
            groups[group_name],
            SHAPE_SIMILARITY_OPTIONS
        );

        group_scores[group_name] = similarity;
    }
    return group_scores;
};

//////////////////////////////// POSE COMPARISON FUNCS


// Compares the current frame group scores to the past X frames group scores and returns the averge similarities no outliers
const GetGroups_NoOutliersHighestGroups = (
    groups,
    current_frame,
    playGameMetadataValue
) => {
    const all_similarity_scores = GetShapeSimilarityWithLookback(groups, current_frame, playGameMetadataValue);
    const all_weighted_avg_scores = GetWeightedAvgGroupsScores(all_similarity_scores);
    const all_similarity_scores_no_outliers = RemoveWeightedAvgOutliers(all_similarity_scores, all_weighted_avg_scores);
    
    // Take highest non outlier score.
    let highest_avgs = {};
    
    for (const group_type of Object.values(GROUP_TYPE)) {
        const sorted = all_similarity_scores_no_outliers.sort((a, b) => b[group_type] - a[group_type]);
        highest_avgs[group_type] = sorted[0][group_type];
    }
    
    return highest_avgs;
};


//////////////////////////////////


export const POSE_COMPARISON_BY_GROUPS_FUNC = {
    // All similarity scores use frame lookback - "similarity scores" are all scores in that lookback period
    
    // Average of all similarity scores with outliers removed
    NoOutliersAverage: 1,
    
    // Highest average score of all groups (avg. head, torso, legs)
    HighestAverage: 2,
    
    // Highest individual group scores are used (head, torso, legs)
    HighestGroups: 3,
    
    // Highest individual group scores are used (head, torso, legs) with outliers removed
    NoOutliersHighestGroups: GetGroups_NoOutliersHighestGroups,
    
    // Top X scores are averaged with outliers removed
    NoOutliersTopXAverage: 4,
    
    // Top X scores are averaged
    TopXAverage: 5,
    
    // Average of upper half of similarity scores with outliers removed
    NoOutliersUpperHalf: 6,
    
    // Top 1 score with outliers removed
    NoOutliersTopScore: 7
}
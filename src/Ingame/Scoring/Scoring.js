import { GetVideoStartAndEndTimeFromMetadata } from '../../utils';
import {
    testIngameScores,
    ingameRawScores,
    ingameCurrentJudgement,
    ingameJudgementTotals,
    ingameAdjustedScores,
    ingameRawJudgements,
} from '../../stores';
import { SplitPoseByGroupXY } from './KeypointGroupSplits';
import { POSE_COMPARISON_BY_GROUPS_FUNC } from './PoseComparisonByGroups';
import { GetScoreFromGroups } from './AdjustedScoreGroups';
import { GetCurrentTopXLastScores } from './FrameScore';
import {
    GetJudgementFromScore,
    GetCurrentJudgementIndex,
    GetCurrentTopJudgementFromPastPeriodWithoutOutliers,
    GetTotalFinalScore,
    JUDGEMENT_VISUALS,
    JUDGEMENT_SCORE_VALUES,
    JUDGEMENTS,
    GetScoringCurrentTime
} from './Judgements';
import { DEFAULT_ACCURACY_SCORE_THRESHOLD } from './Defaults';

/**
 * Every frame starts here.
 *
 * Steps taken to produce a JUDGEMENT value for each frame scored:
 * 1. pose.score is checked against DEFAULT_ACCURACY_SCORE_THRESHOLD:
 *      If it is lower, then no score is given.
 * 2. pose is split into keypoint groups, which are named groups of related keypoints.
 *      Split is done using SplitPoseByGroupXY.
 *      Split produces an object with 3 different sections to be compared individually.
 * 3. group_scores are produced from a few steps:
 *      a. Amount of frames to lookback is given by GROUP_SCORE_FRAME_LOOKBACK.
 *      b. Look back the amount of frames above to find video keypoints.
 *          For each video keypoint found:
 *              Split the keypoints into groups using SplitPoseByGroupXY.
 *              Compare each group between the two keypoint groups using shapeSimilarity.
 *              This produces a value 0-1 of how similar the points in the two groups are.
 *              Store these similarity values in an array.
 *      c. Take the highest similarity values for each group within the array of similarity scores.
 *          There can often be bad similarity data / bad data from TensorFlow, so this helps to alleviate it a bit.
 * 4. raw_score is produced from calling GetScoreFromGroups(group_scores)
 *      GetScoreFromGroups scales each group score to be within a range using DEFAULT_SCORE_SCALING_FUNCTION,
 *      which uses DEFAULT_GROUP_SCORE_THRESHOLDS.
 *          For example, the minimum for Torso might be 0.6 and max 0.95.
 *          Anything below 0.6 will be 0, anything above 0.95 will be 1,
 *          and anything in between will be scaled between 0-1.
 *      It then combines the scores using weights from DEFAULT_GROUP_WEIGHTS.
 *          Torso might be 0.4, so it contributes to 40% of the overall score.
 * 5. raw_score can vary wildly on each frame based on analysis quality, so another method
 * is used to get a more consistent score for this frame.
 *      GetCurrentTopXLastScores is used to get the current frame's score, based on the scores
 *      of previous frames.
 *      a. DEFAULT_SCORE_AVG_FRAME_LOOKBACK is used to get the number of frames to lookback at
 *      previous scores for.
 *      b. All previous overall scores from the last period are added to the last_scores list.
 *      c. Outliers are filtered out (high and low).
 *      d. Average of all overall scores in last_scores is returned.
 * 6. The score calculated in the previous step is this frame's final score.
 * 7. Judgement for this frame is calculated using GetJudgementFromScore on the final frame score calculated.
 * 8. Judgements used in scoring are calculated every JUDGEMENT_INTERVAL.
 *      a. Current judgement index is calculated using GetCurrentJudgementIndex.
 *      b. If there is no judgement yet for the current index, the highest judgement value from the last period
 *      is gotten by GetCurrentTopJudgementFromPastPeriodWithoutOutliers.
 * 9. At the end of the song, the final score is calculated using the judgements from each judgement interval.
 *      a. GetTotalFinalScore adds JUDGEMENT_SCORE_VALUES per judgement and divides the total by the
 *      total value of all potential perfects in the song.
 *      b. This final score between 0-1 is returned.
 * @param {*} pose
 * @param {*} currentTime
 * @param {*} playGameMetadataValue
 * @param {*} ingameRawScoresValue
 * @param {*} ingameAdjustedScoresValue
 * @param {*} ingameJudgementTotalsValue
 * @param {*} ingameRawJudgementsValue
 * @returns
 */
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

    const frame = xx(
        currentTime,
        playGameMetadataValue.fps
    );
    const groups = SplitPoseByGroupXY(pose.keypoints);

    const PoseComparisonFunc =
        POSE_COMPARISON_BY_GROUPS_FUNC.NoOutliersTopScore;
    const group_scores = PoseComparisonFunc(
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
        scoresString += `   ${group_name}: ${raw_score.groups[
            group_name
        ].toFixed(2)}`;
    }

    const judgement = GetJudgementFromScore(thisFrameScore);
    ingameRawJudgementsValue[frame] = judgement;
    ingameRawJudgements.set(ingameRawJudgementsValue);

    scoresString += ` -- ${JUDGEMENT_VISUALS[judgement].name}`;

    testIngameScores.set(scoresString);

    // Update current judgement and judgement values if needed
    const startEndTime = GetVideoStartAndEndTimeFromMetadata(playGameMetadataValue);
    const scoringCurrentTime = GetScoringCurrentTime(currentTime, startEndTime.start, startEndTime.end, {});
    const judgement_index = GetCurrentJudgementIndex(scoringCurrentTime);
    if (!ingameJudgementTotalsValue[judgement_index]) {
        const top_judgement = GetCurrentTopJudgementFromPastPeriodWithoutOutliers(
            ingameRawJudgementsValue,
            frame,
            playGameMetadataValue.fps
        );
        ingameJudgementTotalsValue[judgement_index] = top_judgement;
        ingameJudgementTotals.set(ingameJudgementTotalsValue);
        ingameCurrentJudgement.set(top_judgement);
    }
};

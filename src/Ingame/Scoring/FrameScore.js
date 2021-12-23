import { DEFAULT_SCORE_AVG_FRAME_LOOKBACK } from './Defaults';

const NUM_TOP_SCORES = 8;
const OUTLIER_THRESHOLD = 0.1;

export const GetCurrentTopXLastScores = (
    all_scores,
    currentTime,
    num_scores
) => {
    const num_scores_to_lookat = num_scores || NUM_TOP_SCORES;
    const time_to_lookback = DEFAULT_SCORE_AVG_FRAME_LOOKBACK();

    const last_scores = [];
    
    const all_scores_keys = Object.keys(all_scores).map((k) => parseFloat(k));
    const all_scores_values = Object.values(all_scores);
    const closest_key = all_scores_keys.reduce((a, b) => {
        return Math.abs(b - currentTime) < Math.abs(a - currentTime) ? b : a;
    })
    const closest_key_index = all_scores_keys.indexOf(closest_key);

    for (let index = closest_key_index; index > 0; index--) {
        if (currentTime - all_scores_keys[index] > time_to_lookback) {
            break;
        }

        const time_score = all_scores_values[index];
        if (time_score) {
            last_scores.push(time_score.overall);
        }
    }

    // Get average of top X scores in the last X frames
    const top_5_scores = last_scores
        .sort((a, b) => b - a)
        .slice(0, num_scores_to_lookat);
    const top_score_threshold = top_5_scores[0] * (1 - OUTLIER_THRESHOLD);
    const last_scores_no_outliers = last_scores.filter(
        (s) => s > top_score_threshold
    );

    if (last_scores_no_outliers.length == 0) {
        return 0;
    }
    
    return last_scores_no_outliers.reduce((a, b) => a + b) /
        last_scores_no_outliers.length;
};
import { DEFAULT_SCORE_AVG_FRAME_LOOKBACK } from './Defaults';

const NUM_TOP_SCORES = 8;
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

    // Get average of top X scores in the last X frames
    const top_5_scores = last_scores
        .sort((a, b) => b - a)
        .slice(0, num_scores_to_lookat);
    const top_score_threshold = top_5_scores[0] * (1 - OUTLIER_THRESHOLD);
    const last_scores_no_outliers = last_scores.filter(
        (s) => s > top_score_threshold
    );

    if (last_scores_no_outliers.length == 0) {
        console.warn('No top x scores found');
        return 0;
    }
    
    return last_scores_no_outliers.reduce((a, b) => a + b) /
        last_scores_no_outliers.length;
};
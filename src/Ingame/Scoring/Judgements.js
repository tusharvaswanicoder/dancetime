// List of all judgements used
export const JUDGEMENTS = {
    PERFECT: 1,
    MARVELOUS: 2,
    GREAT: 3,
    GOOD: 4,
    ALMOST: 5,
    MISS: 6
};

// Frequency at which judgements are shown and calculated
export const JUDGEMENT_FREQUENCY = 0.5;

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

/**
 * Each judgement received at JUDGEMENT_FREQUENCY interval will be
 * multiplied by the value here to get the overall score value.
 * 
 * Final score is the sum of all the judgement values received over 
 * the max total score (all perfects).
 */
export const JUDGEMENT_SCORE_VALUES = {
    [JUDGEMENTS.PERFECT]: 5,
    [JUDGEMENTS.MARVELOUS]: 4,
    [JUDGEMENTS.GREAT]: 3,
    [JUDGEMENTS.GOOD]: 2,
    [JUDGEMENTS.ALMOST]: 1,
    [JUDGEMENTS.MISS]: 0,
};

// Returns the current judgement for a judgement index taking the top judgement from the past period
export const GetCurrentTopJudgementFromPastPeriod = (all_judgements, current_frame, fps) => {
    const num_frames_to_lookback = Math.ceil(fps * JUDGEMENT_FREQUENCY);

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

    // Get get top judgement in the last X frames
    return last_judgements.sort((a, b) => b - a)[0];
}

// Given currentTime of a song, in, out, and scoring areas keyframes, returns modified currentTime of only scoring areas
// Ex. If a song has in of 5 seconds and scoring areas keyframes that blocks 5 seconds after the in,
// the value returned from this would be 0 until 10 seconds in, then it would start counting up like normal
// This way, you can use this function to determine the current judgement index and always use it
export const GetScoringCurrentTime = (currentTime, _in, _out, scoring_areas) => {
    // TODO: factor in scoring areas
    const time = Math.max(0, currentTime - _in);
    return Math.min(time, _out - _in);
}

// Returns the total duration of scoring areas given in, out, and scoring areas keyframes
export const GetScoringDurationFromInOutScoringAreas = (
    duration,
    _in,
    _out,
    scoring_areas
) => {
    // TODO: factor in scoring areas
    const dur = Math.max(0, duration - _in);
    return Math.min(dur, _out - _in);
};

const GetTotalFinalPossibleScore = (scoringMaxTime) => {
    const finalIndex = GetCurrentJudgementIndex(scoringMaxTime);
    return finalIndex * JUDGEMENT_SCORE_VALUES[JUDGEMENTS.PERFECT];
}

export const GetTotalFinalScore = (judgement_list, scoringMaxTime) => {
    const values = Object.values(judgement_list);
    let total = 0;

    for (const judgement of values) {
        total += JUDGEMENT_SCORE_VALUES[judgement];
    }
    
    return (total / GetTotalFinalPossibleScore(scoringMaxTime)) * 100;
};

export const GetPerfectPercentage = (judgement_list, scoringMaxTime) => {
    const perfects = Object.values(judgement_list).filter((v) => v == JUDGEMENTS.PERFECT);
    const max_perfects = GetCurrentJudgementIndex(scoringMaxTime); 
    return perfects.length / max_perfects;
}

export const GetJudgementFromScore = (score) => {
    for (const [judgement, cutoff_score] of Object.entries(JUDGEMENT_CUTOFFS)) {
        if (score >= cutoff_score) {
            return judgement;
        }
    }

    return JUDGEMENTS.MISS;
};

export const GetCurrentJudgementIndex = (currentTime) => {
    return Math.floor(currentTime / JUDGEMENT_FREQUENCY);
}
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

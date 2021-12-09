const STAR_SCORE_CUTOFFS = [
    {num_stars: 4, cutoff: 0.8},
    {num_stars: 3, cutoff: 0.6},
    {num_stars: 2, cutoff: 0.4},
    {num_stars: 1, cutoff: 0.2},
]

export const GetNumStarsFromPerfectPercentage = (percentage) => {
    for (const star_cutoff of STAR_SCORE_CUTOFFS) {
        if (percentage >= star_cutoff.cutoff) {
            return star_cutoff.num_stars;
        }
    }
    
    return 0;
}

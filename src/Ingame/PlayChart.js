import { 
    gameState, 
    playGameMetadata, 
    playGameKeypoints,
    ingameScreenShouldShow,
    ingameIsLoading,
    ingameErrorMessage,
    TFJSReady,
    ingameRawScores,
    ingameCurrentJudgement,
    ingameFinalScores,
    ingameEvalScreenShouldShow,
    ingameJudgementTotals,
    ingameAdjustedScores,
    ingameRawJudgements,
    ingameShouldScore,
    ingameNumStars,
    ingameVideoPlayer,
    ingamePlayerPortraits
} from '../stores';
import { GAMESTATE } from '../constants';

export const PlayChart = async (metadata, keypoints) => {
    ingameIsLoading.set(true);
    ingameScreenShouldShow.set(false);
    ingameErrorMessage.set(null);
    TFJSReady.set(false);
    ingameRawScores.set({});
    ingameCurrentJudgement.set({});
    ingameFinalScores.set({});
    ingameEvalScreenShouldShow.set(false);
    ingameJudgementTotals.set({});
    ingameAdjustedScores.set({});
    ingameRawJudgements.set({});
    ingameShouldScore.set(false);
    ingameNumStars.set({});
    ingameVideoPlayer.set(null);
    ingamePlayerPortraits.set({});

    playGameMetadata.set(metadata);
    playGameKeypoints.set(keypoints);
    gameState.set(GAMESTATE.INGAME);
}
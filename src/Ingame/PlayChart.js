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
    ingameFinalScore,
    ingameEvalScreenShouldShow,
    ingameJudgementTotals,
    ingameAdjustedScores,
    ingameRawJudgements,
    ingameShouldScore,
    ingameNumStars,
    ingameVideoPlayer
} from '../stores';
import { GAMESTATE } from '../constants';

export const PlayChart = (metadata, keypoints) => {
    ingameIsLoading.set(true);
    ingameScreenShouldShow.set(false);
    ingameErrorMessage.set(null);
    TFJSReady.set(false);
    ingameRawScores.set({});
    ingameCurrentJudgement.set(null);
    ingameFinalScore.set(0);
    ingameEvalScreenShouldShow.set(false);
    ingameJudgementTotals.set({});
    ingameAdjustedScores.set({});
    ingameRawJudgements.set({});
    ingameShouldScore.set(false);
    ingameNumStars.set(0);
    ingameVideoPlayer.set(null);

    playGameMetadata.set(metadata);
    playGameKeypoints.set(keypoints);
    gameState.set(GAMESTATE.INGAME);
}
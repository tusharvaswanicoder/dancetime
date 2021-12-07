import { 
    gameState, 
    playGameMetadata, 
    playGameKeypoints,
    ingameVideo,
    ingameVideoURL,
    ingameAudio,
    ingameAudioURL,
    ingameCanvas,
    ingameScreenShouldShow,
    ingameIsLoading,
    ingameErrorMessage,
    ingameCTX,
    TFJSReady,
    ingameRawScores,
    ingameCurrentJudgement,
    ingameFinalScore,
    ingameEvalScreenShouldShow,
    ingameJudgementTotals,
    ingameAdjustedScores,
    ingameRawJudgements,
    ingameShouldScore
} from '../stores';
import { GAMESTATE } from '../constants';

export const PlayChart = (metadata, keypoints) => {
    ingameIsLoading.set(true);
    ingameScreenShouldShow.set(false);
    ingameErrorMessage.set(null);
    ingameVideo.set(null);
    ingameVideoURL.set(null);
    ingameAudio.set(null);
    ingameAudioURL.set(null);
    ingameCanvas.set(null);
    ingameCTX.set(null);
    TFJSReady.set(false);
    ingameRawScores.set({});
    ingameCurrentJudgement.set(null);
    ingameFinalScore.set(0);
    ingameEvalScreenShouldShow.set(false);
    ingameJudgementTotals.set({});
    ingameAdjustedScores.set({});
    ingameRawJudgements.set({});
    ingameShouldScore.set(false);

    playGameMetadata.set(metadata);
    playGameKeypoints.set(keypoints);
    gameState.set(GAMESTATE.INGAME);
}
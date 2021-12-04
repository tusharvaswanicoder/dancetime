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
    currentFrameRawScores,
    currentAverageScore,
    ingameCurrentJudgement,
    ingameFinalScore,
    ingameEvalScreenShouldShow
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
    currentFrameRawScores.set(0);
    currentAverageScore.set(0);
    ingameCurrentJudgement.set(null);
    ingameFinalScore.set(0);
    ingameEvalScreenShouldShow.set(false);

    playGameMetadata.set(metadata);
    playGameKeypoints.set(keypoints);
    gameState.set(GAMESTATE.INGAME);
}
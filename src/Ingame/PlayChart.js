import { gameState, playGameMetadata, playGameKeypoints } from '../stores';
import { GAMESTATE } from '../constants';

export const PlayChart = (metadata, keypoints) => {
    playGameMetadata.set(metadata);
    playGameKeypoints.set(keypoints);
    gameState.set(GAMESTATE.INGAME);
}
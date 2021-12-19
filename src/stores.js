import { writable } from "svelte/store";

export const cameraStore = writable(null);
export const cameraStoreVideo = writable(null);
export const cameraCanvasStore = writable(null);
export const cameraCanvasStoreVideo = writable(null);
export const playerStore = writable(null);
export const gradientIdStore = writable(0);

import { NAV_IDS } from './constants';
export const SelectedNavIdStore = writable(NAV_IDS.CREATE);

export const keyPress = writable({});
export const keyDown = writable({});

import { GAMESTATE } from './constants';
export const gameState = writable(GAMESTATE.NOT_INGAME);
export const playGameMetadata = writable({});
export const playGameKeypoints = writable({});
export const playGameCameraStream = writable();

export const ingameVideo = writable();
export const ingameVideoURL = writable();
export const ingameAudio = writable();
export const ingameAudioURL = writable();
export const ingameCanvas = writable();
export const ingameCTX = writable();
export const ingameIsLoading = writable(true);
export const ingameScreenShouldShow = writable(false);
export const ingameErrorMessage = writable();
export const ingameTime = writable(0);
export const ingameCamera = writable();
export const ingameCameraCanvas = writable();
export const TFJSReady = writable(false);
export const ingameShouldScore = writable(false);

// All ingame scores per frame (only frames that were used though, some may be skipped)
export const ingameRawScores = writable({});
export const ingameAdjustedScores = writable({});
export const ingameCurrentJudgement = writable();
export const ingameFinalScore = writable(0);
export const ingameEvalScreenShouldShow = writable(false);
export const ingameJudgementTotals = writable({});
export const ingameRawJudgements = writable({});
export const ingameNumStars = writable(0);

export const testIngameScores = writable('');

export const settingsOpen = writable(false); // Single flag for settings so it can display whenever


export const createCanvas = writable();
export const createCTX = writable();
export const createVideo = writable();
export const createAudio = writable();
export const createVideoCurrentTime = writable(0);
export const createVideoDuration = writable(0);
export const createWaveSurfer = writable();
export const createVideoFPS = writable(30);
export const createLoadingThumbnailsPercent = writable(0);
export const createLoadingMediaPercent = writable(0);
export const createMediaLoaded = writable(false);
export const createLoadingFinished = writable(false);
export const createThumbnailURLs = writable({});
export const createProject = writable();
export const createProjectUnsaved = writable(false);
export const createAAInProgress = writable(false);
export const createEditorDisabled = writable(false);
export const createFramesAnalyzed = writable({});
export const createTabState = writable();
export const createSelectedComponent = writable({});
export const createSelectedComponentIndex = writable(-1);
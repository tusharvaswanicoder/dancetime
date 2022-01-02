import { writable } from "svelte/store";

export const cameraStore = writable(null);
export const cameraStoreVideo = writable(null);
export const cameraCanvasStore = writable(null);
export const cameraCanvasStoreVideo = writable(null);
export const playerStore = writable(null);
export const gradientIdStore = writable(0);

export const modeStateStore = writable();
export const groupmodeStateStore = writable();
export const selectedInitialGamemode = writable(false);

export const keyPress = writable({});
export const keyDown = writable({});
export const message = writable({});

import { GAMESTATE } from './constants';
export const gameState = writable(GAMESTATE.NOT_INGAME);
export const playGameMetadata = writable({});
export const playGameKeypoints = writable({});
export const playGameCameraStream = writable();
export const songWheelSelectedCategory = writable();
export const songWheelChartMetadata = writable({});
export const songWheelCategoryCurrentIndex = writable({});
export const songWheelSelectedChartMetadata = writable();

export const ingameVideoPlayer = writable();
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
export const ingameFinalScores = writable(0);
export const ingameEvalScreenShouldShow = writable(false);
export const ingameJudgementTotals = writable({});
export const ingameRawJudgements = writable({});
export const ingameNumStars = writable(0);

export const testIngameScores = writable('');

export const settingsOpen = writable(false); // Single flag for settings so it can display whenever


export const createCanvas = writable();
export const createCTX = writable();
export const createVideoPlayer = writable();
export const createVideo = writable();
export const createAudio = writable();
export const createVideoCurrentTime = writable(0);
export const createWaveSurfer = writable();
export const createLoadingThumbnailsPercent = writable(0);
export const createLoadingMediaPercent = writable(0);
export const createMediaLoaded = writable(false);
export const createLoadingFinished = writable(false);
export const createThumbnailURLs = writable({});
export const createProject = writable();
export const createProjectUnsaved = writable(false);
export const createAAInProgress = writable(false);
export const createEditorDisabled = writable(false);
export const createTabState = writable();
export const createSelectedComponent = writable({});
export const createSelectedComponentIndex = writable(-1);
export const createProjectPublishing = writable(false);
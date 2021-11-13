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

export const createCanvas = writable();
export const createVideo = writable();
export const createAudio = writable();
export const createVideoCurrentTime = writable();
export const createVideoDuration = writable();
export const createWaveSurfer = writable();
export const createVideoFPS = writable(30);
export const createLoadingPercent = writable(0);
export const createThumbnailURLs = writable({});
export const createProject = writable();
export const createProjectUnsaved = writable(false);
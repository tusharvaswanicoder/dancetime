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

export const CREATE_STATE = {
    PROJECTS_VIEW: 1,
    EDITOR_VIEW: 2
}
export const createStateStore = writable(CREATE_STATE.PROJECTS_VIEW);
export const createCanvas = writable();
export const createVideo = writable();
export const createAudio = writable();
export const createVideoCurrentTime = writable();
export const createVideoDuration = writable();
export const createWaveSurfer = writable();
export const createVideoFPS = writable(30);
import { writable } from "svelte/store";

export const cameraStore = writable(null);
export const cameraCanvasStore = writable(null);
export const playerStore = writable(null);
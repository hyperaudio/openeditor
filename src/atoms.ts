import { atomWithStorage } from 'jotai/utils';

export const darkModeAtom = atomWithStorage(
  'darkMode',
  window?.matchMedia('(prefers-color-scheme: dark)')?.matches ?? false,
);
export const debugModeAtom = atomWithStorage('debugMode', false);
export const measureAtom = atomWithStorage('measure', 55);
export const playerPositionAtom = atomWithStorage('playerPosition', { x: Math.floor(window.innerWidth / 3), y: 0 });

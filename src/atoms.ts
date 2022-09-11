import { atomWithStorage } from 'jotai/utils';

export const darkModeAtom = atomWithStorage('darkMode', false);
export const debugModeAtom = atomWithStorage('debugMode', false);
export const playerPositionAtom = atomWithStorage('playerPosition', { x: 20, y: 0 });

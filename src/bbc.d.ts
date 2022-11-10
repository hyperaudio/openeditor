/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@bbc/stt-align-node' {
  export function alignSTTwithPadding(
    sttWords: { words: { [key: string]: any }[] },
    transcriptText: string,
    start: number,
    end: number,
    padLeft?: string,
    padRight?: string,
  ): { start: number; end: number; text: string }[];
  export function alignSTT(
    sttWords: { words: { [key: string]: any }[] },
    transcriptText: string,
    start: number,
    end: number,
  ): { start: number; end: number; text: string }[];
}

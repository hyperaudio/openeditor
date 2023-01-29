/* eslint-disable @typescript-eslint/no-explicit-any */
import Draftjs, {
  EditorState,
  EditorBlock,
  convertFromRaw,
  convertToRaw,
  getVisibleSelectionRect,
  // ContentBlock,
  RawDraftContentBlock,
} from 'draft-js';

import Editor from './Editor';

const flatten = (list: any[]): any[] => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

const createEntityMap = (blocks: RawDraftContentBlock[]): { [key: string]: any } =>
  flatten(blocks.map((block: RawDraftContentBlock) => block.entityRanges)).reduce(
    (acc: { [key: string]: any }, data: { [key: string]: any }) => ({
      ...acc,
      [data.key]: { type: 'TOKEN', mutability: 'MUTABLE', data },
    }),
    {},
  );

export {
  Editor,
  EditorState,
  Draftjs,
  EditorBlock,
  getVisibleSelectionRect,
  convertFromRaw,
  convertToRaw,
  createEntityMap,
};

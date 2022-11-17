import React from 'react';
// import { styled } from '@mui/material/styles';
import { ContentBlock, ContentState, EditorState } from 'draft-js';

// const PREFIX = 'Playhead';
// const classes = {
//   root: `${PREFIX}`,
// };

// const Root = styled('span')(({ theme }) => ({
//   '.focus-false &': {
//     color: theme.palette.primary.dark,
//     textShadow: `-0.03ex 0 0 currentColor, 0.03ex 0 0 currentColor, 0 -0.02ex 0 currentColor, 0 0.02ex 0 currentColor`,
//     transition: `all ${theme.transitions.duration.standard}`,
//   },
// }));

const PlayheadSpan = ({ children }: { children: JSX.Element[] }): JSX.Element => (
  <span className="Playhead">{children}</span>
);

const PlayheadDecorator = {
  strategy: (
    contentBlock: ContentBlock,
    callback: (offset: number, length: number) => void,
    contentState: ContentState,
    time = 0,
  ) => {
    const { start, end, items } = contentBlock.getData().toJS();

    if (start <= time && time < end) {
      const item = items?.filter(({ start = 0 }) => start <= time).pop();
      if (!item) return;

      callback(item.offset, item.offset + item.length);
    }
  },
  component: PlayheadSpan,
};

export default PlayheadDecorator;

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
import React, { useMemo, useCallback, useReducer, useState, useRef, useEffect, SyntheticEvent } from 'react';
import {
  Editor as DraftEditor,
  EditorState,
  ContentState,
  Modifier,
  CompositeDecorator,
  convertToRaw,
  // DraftBlockType,
  ContentBlock,
  RawDraftContentBlock,
} from 'draft-js';
import TC, { FRAMERATE } from 'smpte-timecode';
import { alignSTTwithPadding } from '@bbc/stt-align-node';
import bs58 from 'bs58';
import { useDebounce } from 'use-debounce';
// import { intersection, arrayIntersection } from 'interval-operations';
import UAParser from 'ua-parser-js';

import PlayheadDecorator from './PlayheadDecorator';
import reducer from './reducer';
// import { Theme } from '@mui/system';

// const filter = createFilterOptions();

const SPEAKER_AREA_WIDTH = 120;
const SPEAKER_AREA_HEIGHT = 26;
const PREFIX = 'Editor';
const classes = {
  root: `${PREFIX}`,
};

const STYLE = `
  div[data-block='true'] + div[data-block='true'] {
    margin-top: 5px;
  }

  div[data-block='true'] {
    padding-left: ${SPEAKER_AREA_WIDTH}px;
    position: relative;
    font-family: 'Noto Sans Mono', SFMono-Regular, Menlo, Consolas, 'Roboto Mono', 'Ubuntu Monospace', 'Noto Mono',
    'Oxygen Mono', 'Liberation Mono', 'Lucida Console', 'Andale Mono WT', 'Andale Mono', 'Lucida Sans Typewriter',
    'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Nimbus Mono L', Monaco, 'Courier New', Courier, monospace,
    'Noto Emoji', 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  }

  /* div[data-block='true'] .Playhead ~ span {
     color: theme.palette.text.disabled,
  } */

  .focus-false div[data-block='true'] .Playhead {
    color: red,
    text-shadow: -0.03ex 0 0 red, 0.03ex 0 0 red, 0 -0.02ex 0 red, 0 0.02ex 0 red;
    transition: all 1s;
  }

  /* div[data-block='true'][data-offset-key] {
    &:after, &:before {
      position: absolute;
    }
    &:hover {
      color: red;
    }
  } */

  div[data-block='true'][data-offset-key]::after, div[data-block='true'][data-offset-key]::before {
    position: absolute;
  }

  div[data-block='true'][data-offset-key]:hover {
    color: red;
    font-family: 'Noto Sans Mono', SFMono-Regular, Menlo, Consolas, 'Roboto Mono', 'Ubuntu Monospace', 'Noto Mono',
    'Oxygen Mono', 'Liberation Mono', 'Lucida Console', 'Andale Mono WT', 'Andale Mono', 'Lucida Sans Typewriter',
    'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Nimbus Mono L', Monaco, 'Courier New', Courier, monospace,
    'Noto Color Emoji', 'Noto Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  }

  div[data-block='true'][data-offset-key]::before {
    background-image: url(data:image/svg+xml,${encodeURIComponent(
      `<svg width="7" height="${SPEAKER_AREA_HEIGHT}" xmlns="http://www.w3.org/2000/svg"><text x="0" y="17.5" style="font-family: sans-serif; font-size: 12px; fill: blue;">▾</text></svg>`,
    )});
    background-position: 97% center;
    background-repeat: no-repeat;
    color: blue;
    cursor: pointer;
    font-weight: 600;
    height: ${SPEAKER_AREA_HEIGHT}px;
    left: 0;
    line-height: ${SPEAKER_AREA_HEIGHT}px;
    overflow: hidden;
    padding-right: 10px;
    text-overflow: ellipsis;
    top: 0;
    white-space: nowrap;
    width: ${SPEAKER_AREA_WIDTH - 10}px;
  }

  div[data-block='true'][data-offset-key]::after {
    bottom: 100%;
    color: orange;
    display: none;
    font-weight: 600;
    left: ${SPEAKER_AREA_WIDTH}px;
    line-height: 1;
    overflow: visible;
    pointer-events: none;
  }

  div[data-block='true'][data-offset-key]:hover::after {
    display: block;
  }
  `;

interface EditorProps {
  initialState: EditorState;
  playheadDecorator: typeof PlayheadDecorator | undefined | null;
  decorators?: CompositeDecorator[] | any[];
  time: number;
  seekTo: (time: number) => void;
  showDialog?: boolean;
  aligner?: (
    words: { [key: string]: any }[],
    text: string,
    start: number,
    end: number,
    callback?: (items: { [key: string]: any }[]) => void,
  ) => { [key: string]: any }[];
  speakers: { [key: string]: any };
  setSpeakers: (speakers: { [key: string]: any }) => void;
  onChange: ({
    speakers,
    blocks,
    contentState,
  }: {
    speakers: { [key: string]: any };
    blocks: RawDraftContentBlock[];
    contentState: ContentState;
  }) => void;
  autoScroll?: boolean;
  play: () => void;
  playing: boolean;
  pause: () => void;
  readOnly?: boolean;
}

const Editor = ({
  initialState = EditorState.createEmpty(),
  playheadDecorator = PlayheadDecorator,
  decorators = [],
  time = 0,
  seekTo,
  showDialog,
  aligner = wordAligner,
  speakers,
  setSpeakers,
  onChange: onChangeProp,
  autoScroll,
  play,
  playing,
  pause,
  readOnly,
  ...rest
}: EditorProps): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [speakers, setSpeakers] = useState(
  //   Object.entries(initialSpeakers).reduce((acc, [id, speaker]) => {
  //     return { ...acc, [id]: { ...speaker, id } };
  //   }, {}),
  // );

  const [wasPlaying, setWasPlaying] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<ContentBlock | null>(null);
  const [speakerAnchor, setSpeakerAnchor] = useState<HTMLElement | null>(null);
  const [speaker, setSpeaker] = useState<{ [key: string]: any } | null>(null);
  const [speakerQuery, setSpeakerQuery] = useState('');

  const onChange = useCallback(
    (editorState: EditorState) => dispatch({ type: editorState.getLastChangeType(), editorState, aligner, dispatch }),
    [aligner],
  );

  const [debouncedState] = useDebounce(state, 1000);

  useEffect(() => {
    if (readOnly) return;
    console.log('onChangeProp');
    onChangeProp({
      speakers,
      // eslint-disable-next-line arrow-body-style
      blocks: convertToRaw(debouncedState.getCurrentContent()).blocks.map((block: RawDraftContentBlock) => {
        // FIXME
        // delete block.depth;
        // delete block.type;
        return block;
      }),
      contentState: debouncedState.getCurrentContent(),
    });
  }, [debouncedState, speakers, onChangeProp, readOnly]);

  const [focused, setFocused] = useState(false);
  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);

  const editorState = useMemo(
    () =>
      !focused && playheadDecorator
        ? EditorState.set(state, {
            decorator: new CompositeDecorator([
              {
                strategy: (contentBlock, callback, contentState) =>
                  playheadDecorator.strategy(contentBlock, callback, contentState, time),
                component: playheadDecorator.component,
              },
              ...decorators,
            ]),
          })
        : state,
    [state, time, playheadDecorator, decorators, focused],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setFocused(true);
      setTimeout(() => setFocused(true), 200);

      if (!editorState) return;
      // console.log(e.target);

      const selectionState = editorState.getSelection();
      if (!selectionState.isCollapsed()) return;

      const target = event.target as HTMLElement;

      if (target.tagName === 'DIV' && target.getAttribute('data-editor')) {
        // FIXME && !rest.readOnly
        const mx = event.clientX;
        const my = event.clientY;
        const { x: bx, y: by } = target.getBoundingClientRect();

        const x = mx - bx;
        const y = my - by;

        if (x < SPEAKER_AREA_WIDTH - 10 && y < SPEAKER_AREA_HEIGHT) {
          const key = target.getAttribute('data-offset-key')?.replace('-0-0', '') ?? 'FIXME'; // FIXME
          const block = editorState.getCurrentContent().getBlockForKey(key);
          const data = block.getData().toJS();
          setCurrentBlock(block);

          setWasPlaying(playing);
          // eslint-disable-next-line no-unused-expressions
          pause && pause();

          setSpeaker({ id: data.speaker, name: speakers?.[data.speaker]?.name });
          setSpeakerAnchor(target);
        }
      } else {
        setCurrentBlock(null);

        let key = selectionState.getAnchorKey();
        if (readOnly) {
          key = target.parentElement?.parentElement?.getAttribute('data-offset-key')?.replace('-0-0', '') ?? 'FIXME'; // FIXME
        }

        if (!key) return;
        const block = editorState.getCurrentContent().getBlockForKey(key);

        let start = selectionState.getStartOffset();
        if (readOnly) {
          start =
            (window.getSelection()?.anchorOffset ?? 0) +
            (target.parentElement?.previousSibling?.textContent?.length ?? 0) +
            (target.parentElement?.previousSibling?.previousSibling?.textContent?.length ?? 0);
        }

        const items = block.getData().get('items');
        const item = items?.filter(({ offset = 0 }) => offset <= start)?.pop();

        console.log('seekTo', item?.start);
        // eslint-disable-next-line no-unused-expressions
        item?.start && seekTo && seekTo(item.start);
      }
    },
    [seekTo, editorState, readOnly, playing, pause, speakers],
  );

  // const handleMouseMove = useCallback(
  //   ({ target }) => {
  //     if (readOnly) return;
  //     console.log(target);
  //     let parent = target;
  //     if (parent.tagName === 'SPAN') parent = parent.parentElement;
  //     if (parent.tagName === 'SPAN') parent = parent.parentElement;
  //     if (parent.tagName !== 'DIV') return;

  //     const key = parent.getAttribute('data-offset-key')?.replace('-0-0', '');
  //     const data = editorState.getCurrentContent().getBlockForKey(key)?.getData().toJS();
  //     if (!data) return;

  //     setActiveInterval && setActiveInterval([data.start, data.end]);
  //   },
  //   [editorState, setActiveInterval, readOnly],
  // );

  const handleSpeakerSet = useCallback(
    (event: SyntheticEvent, newValue: string | { [key: string]: any }) => {
      event.preventDefault();
      event.stopPropagation();
      setSpeakerAnchor(null);
      // eslint-disable-next-line no-unused-expressions
      wasPlaying && play && play();

      if (typeof newValue === 'string') {
        // A: Create new by type-in and Enter press
        // const id = `S${Date.now()}`;
        const id = `S${bs58.encode(Buffer.from(newValue.trim()))}`;
        setSpeakers({ ...speakers, [id]: { name: newValue.trim(), id } });
        setSpeaker({ name: newValue.trim(), id });
        console.log('TODO: handleSpeakerSet, NEW-a:', newValue, id);
        dispatch({
          type: 'change-speaker',
          currentBlock,
          speaker: id,
          editorState,
          aligner,
          dispatch,
        });
      } else if (newValue && newValue.inputValue) {
        // B: Create new by type-in and click on the `Add xyz` option
        // const id = `S${Date.now()}`;
        const id = `S${bs58.encode(Buffer.from(newValue.inputValue.trim()))}`;
        setSpeakers({ ...speakers, [id]: { name: newValue.inputValue.trim(), id } });
        setSpeaker({ name: newValue.inputValue.trim(), id });
        console.log(`TODO: handleSpeakerSet, NEW-b:`, newValue.inputValue.trim(), id);
        dispatch({
          type: 'change-speaker',
          currentBlock,
          speaker: id,
          editorState,
          aligner,
          dispatch,
        });
      } else {
        // C: Choose an already existing speaker
        setSpeaker(newValue);
        console.log('TODO: handleSpeakerSet, EXISTING:', newValue);
        dispatch({
          type: 'change-speaker',
          currentBlock,
          speaker: newValue.id,
          editorState,
          aligner,
          dispatch,
        });
      }
    },
    [speakers, currentBlock, editorState, aligner, wasPlaying, play, setSpeakers],
  );

  const handleClickAway = useCallback(() => {
    // eslint-disable-next-line no-extra-boolean-cast
    if (Boolean(speakerAnchor)) setSpeakerAnchor(null);
    setCurrentBlock(null);

    if (wasPlaying) play();
  }, [speakerAnchor, wasPlaying, play]);

  const handlePastedText = useCallback(
    (text: string) => {
      const blockKey = editorState.getSelection().getStartKey();
      const blocks = editorState.getCurrentContent().getBlocksAsArray();
      const block = blocks.find(block => block.getKey() === blockKey);
      if (!block) return 'not-handled';

      const data = block.getData();

      const blockMap = ContentState.createFromText(text).getBlockMap();
      const newState = Modifier.replaceWithFragment(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        blockMap,
      );

      const changedEditorState = Modifier.setBlockData(newState, editorState.getSelection(), data);
      onChange(EditorState.push(editorState, changedEditorState, 'insert-fragment'));

      return 'handled';
    },
    [editorState, onChange],
  );

  const engine = useMemo(() => {
    const parser = new UAParser();
    parser.setUA(global.navigator?.userAgent);
    return parser.getResult()?.engine?.name;
  }, []);

  const wrapper = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  useEffect(() => {
    if (!autoScroll || (focused && !readOnly) || speakerAnchor) return;

    const blocks = editorState.getCurrentContent().getBlocksAsArray();
    const block = blocks
      .slice()
      .reverse()
      .find(block => block.getData().get('start') <= time);
    if (!block) return;

    const playhead = wrapper.current?.querySelector(`div[data-block='true'][data-offset-key="${block.getKey()}-0-0"]`);

    // see https://bugs.chromium.org/p/chromium/issues/detail?id=833617&q=scrollintoview&can=2
    if (readOnly && engine === 'Blink') {
      playhead?.scrollIntoView();
    } else playhead?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [autoScroll, wrapper, time, focused, speakerAnchor, readOnly, editorState, engine]);

  return (
    <div
      className={`${classes.root} focus-${focused}`}
      onClick={handleClick}
      // onMouseMove={handleMouseMove}
      ref={wrapper}>
      <DraftEditor
        {...{ editorState, onChange, onFocus, onBlur, readOnly, ...rest }}
        // handleDrop={() => true}
        // handleDroppedFiles={() => true}
        // handlePastedFiles={() => true}
        handlePastedText={handlePastedText}
      />
      {editorState
        .getCurrentContent()
        .getBlocksAsArray()
        .map((block: ContentBlock) => (
          <BlockStyle key={block.getKey()} {...{ block, speakers, time }} />
        ))}
      <style scoped>
        {STYLE}
        {`
          .focus-false div[data-block='true'] .Playhead ~ span {
            color: #757575;
          }
        `}
      </style>
    </div>
  );
};

const BlockStyle = ({
  block,
  speakers,
  time,
  activeInterval,
}: {
  block: ContentBlock;
  speakers: any;
  time: number;
  activeInterval?: any[];
}): JSX.Element => {
  const speaker = useMemo(() => speakers?.[block.getData().get('speaker')]?.name ?? '', [block, speakers]);
  const start = useMemo(() => block.getData().get('start'), [block]);
  const end = useMemo(() => block.getData().get('end'), [block]);
  const tc = useMemo(() => timecode(start), [start]);
  // const intersects = useMemo(() => intersection([start, end], activeInterval), [start, end, activeInterval]);

  return (
    <Style
      {...{ speaker, tc }}
      played={time < start}
      current={start <= time && time < end}
      blockKey={block.getKey()}
      intersects={false}
    />
  );
};

const Style = ({
  blockKey,
  speaker,
  played,
  current,
  tc,
  intersects,
}: {
  blockKey: string;
  speaker: string;
  played: boolean;
  current: boolean;
  tc: string;
  intersects?: boolean;
}): JSX.Element => (
  <style scoped>
    {`
      div[data-block='true'][data-offset-key="${blockKey}-0-0"] {
        color: ${played ? 'green' : 'black'};
        border-radius: 10px;
      }
      .Right div[data-block='true'][data-offset-key="${blockKey}-0-0"] {
        background-color: ${current ? 'white' : 'inherit'};
      }
      .Left div[data-block='true'][data-offset-key="${blockKey}-0-0"] {
        background-color: ${current ? '#F5F5F7' : 'inherit'};
      }
      div[data-block='true'][data-offset-key="${blockKey}-0-0"]::before {
        content: '${speaker}';
      }
      div[data-block='true'][data-offset-key="${blockKey}-0-0"]::after {
        content: '${tc}';
      }
    `}
  </style>
);

const timecode = (seconds = 0, frameRate = 25, dropFrame = false): string =>
  TC(seconds * frameRate, frameRate as FRAMERATE, dropFrame)
    .toString()
    .split(':')
    .slice(0, 3)
    .join(':');

const wordAligner = (
  words: { [key: string]: any }[],
  text: string,
  start: number,
  end: number,
  callback?: (items: { start: number; end: number; text: string; length: number; offset: number }[]) => void,
): { start: number; end: number; text: string; length: number; offset: number }[] => {
  const aligned = alignSTTwithPadding({ words }, text, start, end);

  const items = aligned.map(({ start, end, text }, i: number, arr: any[]) => ({
    start,
    end,
    text,
    length: text.length,
    offset:
      arr
        .slice(0, i)
        .map(({ text }: { text: string }) => text)
        .join(' ').length + (i === 0 ? 0 : 1),
  }));

  // eslint-disable-next-line no-unused-expressions
  callback && callback(items);
  return items;
};

export default Editor;

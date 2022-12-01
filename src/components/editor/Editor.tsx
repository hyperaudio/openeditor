/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
import React, { useMemo, useCallback, useReducer, useState, useRef, useEffect, MutableRefObject } from 'react';
import ReactDOM from 'react-dom';
import {
  Editor as DraftEditor,
  EditorState,
  ContentState,
  Modifier,
  CompositeDecorator,
  convertToRaw,
  ContentBlock,
  RawDraftContentBlock,
} from 'draft-js';
import TC, { FRAMERATE } from 'smpte-timecode';
import { alignSTTwithPadding } from '@bbc/stt-align-node';
// import bs58 from 'bs58';
import { useDebounce } from 'use-debounce';
// import { intersection, arrayIntersection } from 'interval-operations';
import UAParser from 'ua-parser-js';
import { useAtom } from 'jotai';
import { AutoComplete } from 'antd';
// import RefAutoComplete from 'antd/lib/auto-complete';
import { nanoid } from 'nanoid';

import { darkModeAtom } from '../../atoms';

import PlayheadDecorator from './PlayheadDecorator';
import reducer from './reducer';

import type { BaseSelectRef } from 'rc-select';

const SPEAKER_AREA_WIDTH = 120;
const SPEAKER_AREA_HEIGHT = 26;
const PREFIX = 'Editor';
const classes = {
  root: `${PREFIX}`,
};

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
  const [wasPlaying, setWasPlaying] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<ContentBlock | null>(null);
  const [speakerAnchor, setSpeakerAnchor] = useState<HTMLElement | null>(null);

  const onChange = useCallback(
    (editorState: EditorState) => dispatch({ type: editorState.getLastChangeType(), editorState, aligner, dispatch }),
    [aligner],
  );

  const [debouncedState] = useDebounce(state, 1000);

  useEffect(() => {
    if (readOnly) return;
    // console.log('onChangeProp');
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

          setSpeakerAnchor(target);
        }
      } else {
        setCurrentBlock(null);
        setSpeakerAnchor(null);

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

        // console.log('seekTo', item?.start);
        // eslint-disable-next-line no-unused-expressions
        item?.start && seekTo && seekTo(item.start);
      }
    },
    [seekTo, editorState, readOnly, playing, pause],
  );

  // const handleClickAway = useCallback(() => {
  //   // eslint-disable-next-line no-extra-boolean-cast
  //   if (Boolean(speakerAnchor)) setSpeakerAnchor(null);
  //   setCurrentBlock(null);

  //   if (wasPlaying) play();
  // }, [speakerAnchor, wasPlaying, play]);

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

  const { x, y } = useMemo(() => speakerAnchor?.getBoundingClientRect() ?? { x: 0, y: 0 }, [speakerAnchor]);

  const updateCurrentBlockSpeaker = useCallback(
    (id: string): void => {
      dispatch({
        type: 'change-speaker',
        currentBlock,
        speaker: id,
        editorState,
        aligner,
        dispatch,
      });
    },
    [aligner, currentBlock, editorState],
  );

  return (
    <>
      {speakerAnchor && currentBlock ? (
        <SpeakerAutoComplete
          // key={currentBlock.getKey()}
          {...{ x, y, speakers, currentBlock, setSpeakers, updateCurrentBlockSpeaker }}
        />
      ) : null}
      <div className={`${classes.root} focus-${focused}`} onClick={handleClick} ref={wrapper}>
        <DraftEditor
          readOnly={readOnly || !!speakerAnchor}
          {...{ editorState, onChange, onFocus, onBlur, ...rest }}
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
        <EditorStyleElement />
      </div>
    </>
  );
};

const SpeakerAutoComplete = ({
  x,
  y,
  currentBlock,
  speakers,
  setSpeakers,
  updateCurrentBlockSpeaker,
}: {
  x: number;
  y: number;
  currentBlock: ContentBlock | null;
  speakers: { [key: string]: any };
  setSpeakers: (speakers: { [key: string]: any }) => void;
  updateCurrentBlockSpeaker: (id: string) => void;
}): JSX.Element => {
  const portalElement = document.getElementById('portal1') as HTMLElement;
  const ref = useRef<BaseSelectRef | null>() as MutableRefObject<BaseSelectRef>;
  const currentSpeaker = useMemo(() => speakers[currentBlock?.getData().get('speaker')], [currentBlock, speakers]);
  const speakerOptions = useMemo(
    () =>
      Object.entries(speakers).map(([value, { name: label }]: [string, { [key: string]: any }]) => ({ label, value })),
    [speakers],
  );

  const [speaker, setSpeaker] = useState<{ [key: string]: any } | null>(currentSpeaker);
  const [value, setValue] = useState<string>(currentSpeaker?.name ?? '');
  const [options, setOptions] = useState<{ value: string }[]>(speakerOptions);

  const onSearch = (searchText: string): void => {
    setOptions(
      !searchText ? [] : speakerOptions.filter(({ label }) => label.toLowerCase().includes(searchText.toLowerCase())),
    );
  };

  const onSelect = useCallback(
    (key: string): void => {
      console.log('onSelect', key);
      setSpeaker(speakers[key.trim()] ?? null);
      setValue(speakers[key.trim()].name);
      // updateCurrentBlockSpeaker(key.trim());
    },
    [speakers, updateCurrentBlockSpeaker],
  );

  const [testValue, setTestValue] = useState<string>('');

  const onChange = useCallback(
    (key: string): void => {
      console.log('onChange', key);
      if (speakers[key.trim()]) {
        console.log('onChange: set existing value', key);
        setSpeaker(speakers[key.trim()] ?? null);
        setValue(speakers[key.trim()].name);
        // updateCurrentBlockSpeaker(key.trim());
      } else if (currentSpeaker?.default) {
        console.log('onChange: set existing value + replace', key);
        // replace/update speaker
        setSpeaker({ ...currentSpeaker, name: key.trim(), default: false });
        setValue(key);
        // setSpeakers({ ...speakers, [speaker.id]: { ...speaker, name: key.trim(), default: false } });
      } else {
        // add speaker
        console.log('onChange: add speaker', key);
        const id = `S${nanoid(3)}`;
        const newSpeaker = { name: key.trim(), id, default: false };
        setSpeaker(newSpeaker);
        setValue(key);
        // updateCurrentBlockSpeaker(id);
        // setSpeakers({ ...speakers, [id]: newSpeaker });
      }
    },
    [speakers, currentSpeaker],
  );

  const onBlur = useCallback(() => {
    setSpeakers({ ...speakers, [speaker?.id]: speaker });
    if (speaker && currentSpeaker !== speaker.id) updateCurrentBlockSpeaker(speaker.id);
  }, [setSpeakers, speakers, speaker, currentSpeaker, updateCurrentBlockSpeaker]);

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'absolute',
        top: y + window.scrollY - 3,
        left: x + window.scrollX - 12,
        width: SPEAKER_AREA_WIDTH,
        height: SPEAKER_AREA_HEIGHT,
      }}>
      <style>{`body { overflow-y: hidden; }`}</style>
      <AutoComplete
        autoFocus
        ref={ref}
        value={value}
        options={options}
        style={{ width: SPEAKER_AREA_WIDTH - 10 }}
        onSelect={onSelect}
        onSearch={onSearch}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Speaker"
      />
    </div>,
    portalElement,
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
  const [darkMode] = useAtom(darkModeAtom);
  const speaker = useMemo(() => speakers?.[block.getData().get('speaker')]?.name ?? '', [block, speakers]);
  const start = useMemo(() => block.getData().get('start'), [block]);
  const end = useMemo(() => block.getData().get('end'), [block]);
  const tc = useMemo(() => timecode(start), [start]);
  // const intersects = useMemo(() => intersection([start, end], activeInterval), [start, end, activeInterval]);

  return (
    <BlockStyleElement
      {...{ speaker, tc, darkMode }}
      future={time < start}
      current={start <= time && time < end}
      blockKey={block.getKey()}
      intersects={false}
    />
  );
};

const BlockStyleElement = ({
  blockKey,
  speaker,
  future,
  current,
  tc,
  intersects,
  darkMode,
}: {
  blockKey: string;
  speaker: string;
  future: boolean;
  current: boolean;
  tc: string;
  intersects?: boolean;
  darkMode: boolean;
}): JSX.Element => (
  <style scoped>
    {`
      div[data-block='true'][data-offset-key="${blockKey}-0-0"] {
        color: ${future ? '#757575' : darkMode ? 'white' : 'black'};
        font-weight: ${future ? 400 : 500};
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

const EditorStyleElement = (): JSX.Element => {
  const [darkMode] = useAtom(darkModeAtom);

  const style = useMemo(
    () => `
  div[data-block='true'] + div[data-block='true'] {
    margin-top: 24px;
  }

  div[data-block='true'] {
    padding-left: ${SPEAKER_AREA_WIDTH}px;
    position: relative;
    font-family: 'Noto Sans Mono', SFMono-Regular, Menlo, Consolas, 'Roboto Mono', 'Ubuntu Monospace', 'Noto Mono',
    'Oxygen Mono', 'Liberation Mono', 'Lucida Console', 'Andale Mono WT', 'Andale Mono', 'Lucida Sans Typewriter',
    'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Nimbus Mono L', Monaco, 'Courier New', Courier, monospace,
    'Noto Emoji', 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: 16px;
    font-weight: 400;
  }

  .ant-select-auto-complete input {
    font-family: 'Noto Sans Mono', SFMono-Regular, Menlo, Consolas, 'Roboto Mono', 'Ubuntu Monospace', 'Noto Mono',
    'Oxygen Mono', 'Liberation Mono', 'Lucida Console', 'Andale Mono WT', 'Andale Mono', 'Lucida Sans Typewriter',
    'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Nimbus Mono L', Monaco, 'Courier New', Courier, monospace,
    'Noto Emoji', 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: 14px;
    font-weight: 400;
  }

  div[data-block='true'] .Playhead ~ span {
    color: #757575;
    font-weight: 400;
  }

  .focus-false div[data-block='true'] .Playhead ~ span {
    color: #757575;
    font-weight: 400;
  }

  .focus-false div[data-block='true'] .Playhead {
    color: #177ddc;
    /* text-shadow: -0.03ex 0 0 blue, 0.03ex 0 0 blue, 0 -0.02ex 0 blue, 0 0.02ex 0 blue; */
    font-weight: 600;
    transition: all 0.2s;
  }

  div[data-block='true'][data-offset-key]::after, div[data-block='true'][data-offset-key]::before {
    position: absolute;
  }

  div[data-block='true'][data-offset-key]:hover {
    color: ${darkMode ? 'white' : 'black'};
    font-family: 'Noto Sans Mono', SFMono-Regular, Menlo, Consolas, 'Roboto Mono', 'Ubuntu Monospace', 'Noto Mono',
    'Oxygen Mono', 'Liberation Mono', 'Lucida Console', 'Andale Mono WT', 'Andale Mono', 'Lucida Sans Typewriter',
    'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Nimbus Mono L', Monaco, 'Courier New', Courier, monospace,
    'Noto Color Emoji', 'Noto Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  }

  div[data-block='true'][data-offset-key]::before {
    background-image: url(data:image/svg+xml,${encodeURIComponent(
      `<svg width="7" height="${SPEAKER_AREA_HEIGHT}" xmlns="http://www.w3.org/2000/svg"><text x="0" y="17.5" style="font-family: sans-serif; font-size: 12px; fill: #177ddc;">▾</text></svg>`,
    )});
    background-position: 97% center;
    background-repeat: no-repeat;
    color: #177ddc;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
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
    color: transparent;
    /* display: none; */
    display: block;
    font-size: 12px;
    font-weight: 500;
    left: ${SPEAKER_AREA_WIDTH}px;
    line-height: 1;
    overflow: visible;
    pointer-events: none;
    transition-delay: 1s;
  }

  div[data-block='true'][data-offset-key]:hover::after {
    display: block;
    color: #177ddc;
    transition: 0.2s;
  }
  `,
    [darkMode],
  );
  return <style scoped>{style}</style>;
};

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

import React from 'react';
import ReactDOM from 'react-dom';
import { Prompt } from 'react-router-dom';
import { Map } from 'immutable';
import {
  Editor,
  EditorBlock,
  EditorState,
  ContentState,
  CompositeDecorator,
  convertFromRaw,
  convertToRaw,
  Modifier,
  SelectionState,
} from 'draft-js';
import chunk from 'lodash.chunk';
import debounce from 'p-debounce';
import VisibilitySensor from 'react-visibility-sensor';
import Timecode from 'smpte-timecode';
import {
  message,
  Empty,
  AutoComplete,
  Form,
  Button,
  Tooltip,
  Affix,
  Icon,
  Modal,
  Layout,
  Input,
  Radio,
  Drawer,
  Row,
  Col,
  Popover,
  Badge,
  Spin,
  BackTop,
} from 'antd';

// import { alignSTT } from '@bbc/stt-align-node';
import { SequenceMatcher } from 'difflib';

import WaveformData from 'waveform-data';
import wavefont from 'wavefont';

import waveform from './data/wave.json';

import exportTranscript from './utils/exportTranscript.js';
import { updateTranscript, getTranscript, generateId } from './api';
import matchCorrection from './overtyper/matchCorrection';
import applyCorrection from './overtyper/applyCorrection';
import isMatchComplete from './overtyper/isMatchComplete';

const { Content } = Layout;
const RadioGroup = Radio.Group;

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

message.config({ top: 100 });

const WAVE = false;

// const PortalAutoComplete = ({ speaker, setSpeaker, speakers, onFocus, handleBlur }) => {
//   return ReactDOM.createPortal(
//     <AutoComplete
//       dataSource={speakers.includes(speaker) || speaker === '' ? speakers : [speaker, ...speakers]}
//       value={speaker}
//       onSelect={setSpeaker}
//       // onSearch={setSpeaker}
//       onChange={setSpeaker}
//       placeholder="speaker name"
//       onFocus={onFocus}
//       onBlur={handleBlur}
//     />,
//     document.getElementById('root2')
//   );
//   // return null;

//   // return (
//   //   <AutoComplete
//   //     dataSource={speakers.includes(speaker) || speaker === '' ? speakers : [speaker, ...speakers]}
//   //     value={speaker}
//   //     onSelect={setSpeaker}
//   //     // onSearch={setSpeaker}
//   //     onChange={setSpeaker}
//   //     placeholder="speaker name"
//   //     onFocus={onFocus}
//   //     onBlur={handleBlur}
//   //   />
//   // );
// };

class CustomBlock extends React.Component {
  constructor(props) {
    super(props);

    const status = props.block.getData().get('status');

    const speaker = props.block.getData().get('speaker');
    this.state = {
      speaker: speaker ?? '',
      status: status ? status : 'transcribed',
    };
  }

  toggleStatus = () => {
    const {
      block,
      blockProps: { changeBlockData },
    } = this.props;

    this.setState({ status: this.state.status === 'corrected' ? 'edited' : 'corrected' }, () =>
      changeBlockData(block, this.state)
    );
  };

  setSpeaker = speaker => {
    console.log({ speaker });
    this.setState({ speaker });
  };

  align = () => {
    const {
      block,
      blockProps: { alignBlock },
    } = this.props;

    alignBlock(block);
  };

  handleFocus = () => {
    console.log('FOCUS');

    const {
      block,
      blockProps: { changeBlockData, onFocus },
    } = this.props;

    onFocus();
  };

  handleBlur = () => {
    console.log('BLUR');

    const {
      block,
      blockProps: { changeBlockData, onBlur },
    } = this.props;

    changeBlockData(block, this.state);
    onBlur();
  };

  render() {
    const {
      block,
      blockProps: { speakers, onFocus },
    } = this.props;
    const { speaker, status } = this.state;

    const start = block.getData().get('start');
    // const end = block.getData().get('end');
    // const wave = block.getData().get('wave');
    const key = block.getKey();
    const type = block.getType();

    const [hh, mm, ss] = new Timecode((start / 1e3) * 30, 30)
      .toString()
      .split(':')
      .slice(0, 3);

    return (
      <Row gutter={24} className="WrapperBlock" data-start={start} key={key}>
        <Col span={2} className="timecode" contentEditable={false} onClick={e => e.stopPropagation()}>
          <span className={hh === '00' ? 'zero' : null}>{hh}</span>
          <span className="separator">:</span>
          <span className={hh === '00' && mm === '00' ? 'zero' : null}>
            {mm.charAt(0) !== '0' ? (
              mm
            ) : (
              <>
                <span className="zero">0</span>
                {mm.charAt(1)}
              </>
            )}
          </span>
          <span className="separator">:</span>
          <span>{ss}</span>
          {/* <br />[{start} - {end}] */}
        </Col>
        <Col
          span={2}
          className="speaker"
          contentEditable={false}
          onClick={e => e.stopPropagation()}
          // onKeyDown={e => e.stopPropagation()}
          // onKeyPress={e => e.stopPropagation()}
          // onKeyUp={e => e.stopPropagation()}
        >
          <Popover
            content={
              <AutoComplete
                // {...{ speaker, setSpeaker: this.setSpeaker, speakers, onFocus, handleBlur: this.handleBlur }}

                dataSource={speakers.includes(speaker) || speaker === '' ? speakers : [speaker, ...speakers]}
                value={speaker}
                onSelect={this.setSpeaker}
                // onSearch={this.setSpeaker}
                onChange={this.setSpeaker}
                placeholder="speaker name"
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
              />
            }
            trigger="click"
          >
            {speaker !== null && speaker.trim().length > 0 ? speaker.trim() : <i>empty</i>}
          </Popover>
        </Col>
        <Col span={16} className={type === 'waveform' ? 'wave' : ''}>
          {/* <div contentEditable={false} className="wave">
            {wave}
          </div> */}
          <VisibilitySensor intervalCheck={false} scrollCheck={true} partialVisibility={true}>
            {({ isVisible }) =>
              isVisible ? (
                <EditorBlock {...this.props} />
              ) : (
                <div className="text" contentEditable={false}>
                  {block.text}
                </div>
              )
            }
          </VisibilitySensor>
        </Col>
        <Col span={1} offset={1} className="status" contentEditable={false} onClick={e => e.stopPropagation()}>
          <Badge status={status === 'corrected' ? 'success' : 'default'} text={status} onClick={this.toggleStatus} />
          {/*
          <Button type="dashed" size="small" onClick={this.align}>
            align
          </Button>
           */}
        </Col>
      </Row>
    );
  }
}

class TranscriptEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: 'Transcript loading…',
      loading: false,
      saving: false,
      readOnly: false,
      speakers: [],
      exportValue: 1,
      blockNavigation: false,
      overtype: '',
      playheadChange: Date.now(),
      currentEditorKey: null,
      scrollY: 0,
    };

    this.queue = [];
    this.editorRefs = {};

    this.debouncedSave = debounce(this.save, 3000);

    window.addEventListener('beforeunload', e => {
      if (this.state.blockNavigation) {
        this.hide = message.loading('Saving in progress…', 0);
        e.preventDefault();
        e.returnValue = '';
      } else {
        delete e['returnValue'];
      }
    });
  }

  componentDidMount() {
    this.loadTranscript(this.props.transcript);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // const { blockKey } = this.state;
    const time = nextProps.time * 1e3;

    if (time && time !== this.props.time * 1e3 && this.state.editors) {
      this.setPlayhead(time);

      return true;
    }

    // if (blockKey && blockKey !== nextState.blockKey) {
    //   console.log(blockKey, nextState.blockKey);
    //   const editor = this.state.editors.find(
    //     editor =>
    //       !!editor.editorState
    //         .getCurrentContent()
    //         .getBlocksAsArray()
    //         .find(block => block.getKey() === blockKey)
    //   );

    //   const block = editor.editorState
    //     .getCurrentContent()
    //     .getBlocksAsArray()
    //     .find(block => block.getKey() === blockKey);

    //   this.alignBlock(block, false);
    // }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      overtyperVisible,
      playheadEntityKey,
      playheadIgnore,
      playheadChange,
      currentEditorKey,
      scrollY,
    } = this.state;
    if (overtyperVisible && playheadEntityKey) {
      const playhead = document.querySelector(`span[data-entity-key="${playheadEntityKey}"]`);
      if (playhead) playhead.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } else if (playheadEntityKey && !playheadIgnore && playheadChange !== prevState.playheadChange) {
      const playhead = document.querySelector(`span[data-entity-key="${playheadEntityKey}"]`);
      if (!playhead) this.setPlayhead();
    }

    if (playheadChange !== prevState.playheadChange && currentEditorKey) {
      // console.log({ scrollY });
      // this.editorRefs[currentEditorKey].focus(scrollY);
      window.scrollTo(0, scrollY);
    }
  }

  setDomEditorRef = (key, ref) => (this.editorRefs[key] = ref);

  setPlayhead = (time = this.props.time * 1e3) => {
    // console.log('setPlayhead', time);
    this.state.editors.forEach(({ editorState, key: playheadEditorKey }) => {
      const contentState = editorState.getCurrentContent();
      const blocks = contentState.getBlocksAsArray();
      let playheadBlockIndex = -1;

      playheadBlockIndex = blocks.findIndex(block => {
        const start = block.getData().get('start');
        const end = block.getData().get('end');
        return start <= time && time < end;
      });

      if (playheadBlockIndex > -1) {
        const playheadBlock = blocks[playheadBlockIndex];
        const entities = [
          ...new Set(
            playheadBlock
              .getCharacterList()
              .toArray()
              .map(character => character.getEntity())
          ),
        ].filter(value => !!value);

        const playheadEntityIndex = entities.findIndex(entity => {
          const { start, end } = contentState.getEntity(entity).getData();
          return start <= time && time < end;
        });

        const playheadEntity = entities[playheadEntityIndex];

        if (playheadEntity) {
          const { key } = contentState.getEntity(playheadEntity).getData();
          if (key === this.state.playheadEntityKey) return;

          const playheadWindow = entities
            .slice(playheadEntityIndex > 10 ? playheadEntityIndex - 10 : 0, playheadEntityIndex + 1)
            .map(entity => contentState.getEntity(entity).getData().key);

          const text = playheadBlock.getText();
          const fullWindow = entities.map(entity => {
            const e = contentState.getEntity(entity).getData();
            return {
              text: text.substring(e.offset, e.offset + e.length),
              start: e.start,
              end: e.end,
              offset: e.offset,
              length: e.length,
            };
          });

          const textWindow = fullWindow.slice(
            playheadEntityIndex > 10 ? playheadEntityIndex - 10 : 0,
            playheadEntityIndex + 1
          );

          const textWindowStart = playheadEntityIndex > 10 ? playheadEntityIndex - 10 : 0;

          this.setState({
            playheadEditorKey,
            // playheadBlock,
            playheadBlockKey: playheadBlock.getKey(),
            playheadEntityKey: key,
            playheadIgnore: false,
            playheadWindow,
            textWindow,
            fullWindow,
            textWindowStart,
            // textBlock: text.split(' '),
          });
        } else {
          this.setState({ playheadEditorKey, playheadBlockKey: playheadBlock.getKey(), playheadIgnore: true });
        }
      }
    });
  };

  handleOvertyperInput = ({ nativeEvent }) => {
    const { value } = nativeEvent.srcElement;
    if (this.props.player) this.props.player.pause();
    // alignBlock?
    console.log({ textWindow: this.state.textWindow, value });
    const match = matchCorrection(
      this.state.textWindow.map(({ text }) => text),
      value
    );

    this.setState({ match, overtype: value });
    console.log(match);
  };

  applyOvertyper = ({ nativeEvent }) => {
    if (this.state.match && isMatchComplete(this.state.match)) {
      console.log(applyCorrection(this.state.fullWindow, this.state.textWindowStart, this.state.match));
    }
    this.setState({ match: null, overtype: '' });
    nativeEvent.srcElement.value = '';
    if (this.props.player) this.props.player.play();
  };

  customBlockRenderer = contentBlock => {
    const type = contentBlock.getType();
    if (type === 'paragraph' || type === 'waveform') {
      return {
        component: CustomBlock,
        editable: type === 'paragraph',
        props: {
          speakers: this.state.speakers,
          onFocus: () => this.setState({ readOnly: true }),
          onBlur: () => this.setState({ readOnly: false }),
          changeBlockData: this.changeBlockData,
          alignBlock: this.alignBlock,
        },
      };
    }
    return null;
  };

  handleClick = event => {
    let element = event.nativeEvent.target;

    while (element && !element.hasAttribute('data-start') && element.parentElement) element = element.parentElement;
    if (element && element.hasAttribute('data-start')) {
      let t = parseFloat(element.getAttribute('data-start'));
      // console.log('found data-start', t, element);

      if (element.classList.contains('WrapperBlock')) {
        element = event.nativeEvent.target.parentElement.previousSibling;
        while (element && !element.hasAttribute('data-start') && element.previousSibling)
          element = element.previousSibling;
        if (element && element.hasAttribute('data-start')) {
          t = parseFloat(element.getAttribute('data-start'));
          // console.log('found sibling data-start', t, element);
        }
      }

      if (this.props.player) this.props.player.currentTime = t / 1e3;
    }
  };

  changeBlockData = (block, data) => {
    const { speakers } = this.state;

    const blockKey = block.getKey();
    const editor = this.state.editors.find(
      editor =>
        !!editor.editorState
          .getCurrentContent()
          .getBlocksAsArray()
          .find(block => block.getKey() === blockKey)
    );

    console.log(editor.key, blockKey, { ...block.getData().toJS(), ...data });

    const editorState = editor.editorState;
    const currentContent = editorState.getCurrentContent();
    // const blocks = createRaw(currentContent.getBlocksAsArray(), currentContent);
    // blocks.find(({ key }) => key === blockKey).data = { ...block.getData().toJS(), ...data };

    // const entityMap = createEntityMap(blocks);

    // const contentState = convertFromRaw({
    //   blocks,
    //   entityMap,
    // });

    const speaker = data.speaker;
    if (speaker !== null && speaker.trim().length > 0 && !speakers.includes(speaker.trim()))
      this.setState({ speakers: [speaker, ...speakers] });

    const blockData = block.getData();
    const contentStateWithBlockData = Modifier.setBlockData(
      currentContent,
      SelectionState.createEmpty(blockKey),
      Map({ start: blockData.get('start'), end: blockData.get('end'), speaker: data.speaker })
    );

    const newEditorState = EditorState.forceSelection(
      EditorState.push(editorState, contentStateWithBlockData, 'change-block-data'),
      editorState.getSelection()
    );

    const editorIndex = this.state.editors.findIndex(ed => ed.key === editor.key);
    const prevEditorState = this.state.editors[editorIndex].editorState;

    this.setState(
      {
        blockKey,
        editors: [
          ...this.state.editors.slice(0, editorIndex),
          { editorState: newEditorState, key: editor.key, previewState: createPreview(newEditorState) },
          ...this.state.editors.slice(editorIndex + 1),
        ],
      },
      () => this.saveState(prevEditorState, newEditorState)
    );

    // this.onChange(EditorState.push(editorState, contentStateWithBlockData, 'change-block-data'), editor.key);
  };

  alignBlock = (block, skipUpdate = false) => {
    // NOOP
    // const blockKey = block.getKey();
    // console.log('alignBlock', blockKey);
    // const editor = this.state.editors.find(
    //   editor =>
    //     !!editor.editorState
    //       .getCurrentContent()
    //       .getBlocksAsArray()
    //       .find(block => block.getKey() === blockKey)
    // );
    // const editorState = editor.editorState;
    // const currentContent = editorState.getCurrentContent();
    // const blocks = createRaw(currentContent.getBlocksAsArray(), currentContent);
    // const blockIndex = blocks.findIndex(({ key }) => key === blockKey);
    // const text = blocks[blockIndex].text;
    // let words = blocks[blockIndex].entityRanges
    //   .map(({ start, end, offset, length }) => ({
    //     start: start / 1e3,
    //     end: end / 1e3,
    //     text: text.substring(offset, offset + length).trim(),
    //   }))
    //   .filter(({ text }) => text.length > 0);
    // console.log(text === words.map(({ text }) => text).join(' '), text, words.map(({ text }) => text).join(' '));
    // if (text === words.map(({ text }) => text).join(' ')) return blocks[blockIndex];
    // words = [
    //   {
    //     text: 'STARTSTART',
    //     start: words[0].start - (0.08475 + 0.05379 * 'STARTSTART'.length),
    //     end: words[0].start,
    //   },
    //   ...words,
    //   {
    //     text: 'ENDEND',
    //     start: words[words.length - 1].end,
    //     end: words[words.length - 1].end + 0.08475 + 0.05379 * 'ENDEND'.length,
    //   },
    // ];
    // const resultAligned = alignSTT(
    //   {
    //     words,
    //   },
    //   `STARTSTART ${text} ENDEND`
    // );
    // // const matcher = new SequenceMatcher(null, words.map(({ text }) => text), resultAligned.map(({ text }) => text));
    // // const opCodes = matcher.getOpcodes();
    // // console.log(
    // //   { text: `STARTSTART ${text} ENDEND`, input: words, output: resultAligned },
    // //   opCodes.map(([op, a, b, c, d]) => ({
    // //     op,
    // //     input: words.slice(a, b),
    // //     output: resultAligned.slice(c, d),
    // //   }))
    // // );
    // resultAligned.splice(0, 1);
    // resultAligned.pop();
    // blocks[blockIndex].entityRanges = resultAligned
    //   .reduce((acc, { start, end, text }) => {
    //     const p = acc.pop();
    //     return [
    //       ...acc,
    //       p,
    //       {
    //         key: generateId(),
    //         start: start * 1e3,
    //         end: end * 1e3,
    //         offset: p ? p.offset + p.length + 1 : 0,
    //         length: text.length,
    //       },
    //     ];
    //   }, [])
    //   .filter(e => !!e);
    // blocks[blockIndex].text = resultAligned.map(({ text }) => text).join(' ');
    // if (skipUpdate) return blocks[blockIndex];
    // const entityMap = createEntityMap(blocks);
    // // const newEditorState = EditorState.push(
    // //   editorState,
    // //   convertFromRaw({
    // //     blocks,
    // //     entityMap,
    // //   }),
    // //   'change-block-data'
    // // );
    // const newEditorState = EditorState.set(
    //   EditorState.createWithContent(
    //     convertFromRaw({
    //       blocks: blocks,
    //       entityMap,
    //     }),
    //     decorator
    //   ),
    //   {
    //     selection: editorState.getSelection(),
    //     undoStack: editorState.getUndoStack(),
    //     redoStack: editorState.getRedoStack(),
    //     lastChangeType: editorState.getLastChangeType(),
    //     allowUndo: true,
    //   }
    // );
    // this.onChange(newEditorState, editor.key);
  };

  onChange = (editorState, key) => {
    if (this.state.readOnly) return;
    console.log({ editorState, key });

    const editorIndex = this.state.editors.findIndex(editor => editor.key === key);
    const prevEditorState = this.state.editors[editorIndex].editorState;

    const contentChange =
      editorState.getCurrentContent() === this.state.editors[editorIndex].editorState.getCurrentContent()
        ? null
        : editorState.getLastChangeType();
    console.log({ contentChange });

    const blockKey = editorState.getSelection().getStartKey();

    const blocks = editorState.getCurrentContent().getBlocksAsArray();
    const blockIndex = blocks.findIndex(block => block.getKey() === blockKey);

    if (!contentChange && blockIndex === blocks.length - 1 && editorIndex < this.state.editors.length - 1) {
      const editorStateA = editorState;
      const editorStateB = this.state.editors[editorIndex + 1].editorState;

      const blocksA = editorStateA
        .getCurrentContent()
        .getBlockMap()
        .toArray();
      const blocksB = editorStateB
        .getCurrentContent()
        .getBlockMap()
        .toArray();

      if (true && blocksA.length < 20) {
        const blocks = [
          ...createRaw(blocksA, editorStateA.getCurrentContent()),
          ...createRaw(blocksB, editorStateB.getCurrentContent()),
        ];

        const entityMap = createEntityMap(blocks);

        const editorStateAB = EditorState.set(
          EditorState.createWithContent(
            convertFromRaw({
              blocks,
              entityMap,
            }),
            decorator
          ),
          {
            selection: editorStateA.getSelection(),
            // undoStack: editorStateA.getUndoStack(),
            // redoStack: editorStateA.getRedoStack(),
            lastChangeType: editorStateA.getLastChangeType(),
            allowUndo: true,
          }
        );

        // const prevEditorState = this.state.editors[editorIndex].editorState;
        this.setState(
          {
            playheadChange: Date.now(),
            currentEditorKey: key,
            scrollY: window.scrollY,
            editors: [
              ...this.state.editors.slice(0, editorIndex),
              { editorState: editorStateAB, key, previewState: createPreview(editorStateAB) },
              ...this.state.editors.slice(editorIndex + 2),
            ],
          }
          // () => setTimeout(() => this.setPlayhead(), 200)
        );
      } else {
        const blocksAB = [
          ...createRaw(blocksA.slice(-10), editorStateA.getCurrentContent()),
          ...createRaw(blocksB, editorStateB.getCurrentContent()),
        ];

        const entityMapAB = createEntityMap(blocksAB);

        const editorStateAB = EditorState.set(
          EditorState.createWithContent(
            convertFromRaw({
              blocks: blocksAB,
              entityMap: entityMapAB,
            }),
            decorator
          ),
          {
            selection: editorStateA.getSelection(),
            // undoStack: editorStateA.getUndoStack(),
            // redoStack: editorStateA.getRedoStack(),
            lastChangeType: editorStateA.getLastChangeType(),
            allowUndo: true,
          }
        );

        const blocksC = [...createRaw(blocksA.slice(0, blocksA.length - 10), editorStateA.getCurrentContent())];

        const entityMapC = createEntityMap(blocksC);

        const editorStateC = EditorState.set(
          EditorState.createWithContent(
            convertFromRaw({
              blocks: blocksC,
              entityMap: entityMapC,
            }),
            decorator
          ),
          {
            // selection: editorStateA.getSelection(),
            // undoStack: editorStateA.getUndoStack(),
            // redoStack: editorStateA.getRedoStack(),
            lastChangeType: editorStateA.getLastChangeType(),
            allowUndo: true,
          }
        );

        // const block = blocksA.slice(-10).slice(-1)[0];
        // const start = block.getData().get('start');

        // const prevEditorState = this.state.editors[editorIndex].editorState;
        this.setState(
          {
            playheadChange: Date.now(),
            currentEditorKey: key,
            scrollY: window.scrollY,
            editors: [
              ...this.state.editors.slice(0, editorIndex),
              { editorState: editorStateC, key: `editor-${generateId()}`, previewState: createPreview(editorStateC) },
              { editorState: editorStateAB, key, previewState: createPreview(editorStateAB) },
              ...this.state.editors.slice(editorIndex + 2),
            ],
          }
          // () => setTimeout(() => this.setPlayhead(), 200)
        );
      }
    } else if (contentChange === 'split-block') {
      const splitBlocks = createRaw(blocks, editorState.getCurrentContent());

      console.log(splitBlocks[blockIndex - 1], splitBlocks[blockIndex]);
      if (splitBlocks[blockIndex].text.length === 0) splitBlocks[blockIndex].text = ' ';

      // prev block
      splitBlocks[blockIndex - 1].data.end =
        splitBlocks[blockIndex - 1].entityRanges.length > 0
          ? splitBlocks[blockIndex - 1].entityRanges[splitBlocks[blockIndex - 1].entityRanges.length - 1].end
          : splitBlocks[blockIndex - 1].data.end;

      // new block
      splitBlocks[blockIndex].data.speaker = splitBlocks[blockIndex - 1].data.speaker;
      splitBlocks[blockIndex].data.start = splitBlocks[blockIndex - 1].data.end;
      splitBlocks[blockIndex].data.end =
        splitBlocks[blockIndex].entityRanges.length > 0
          ? splitBlocks[blockIndex].entityRanges[splitBlocks[blockIndex].entityRanges.length - 1].end
          : splitBlocks[blockIndex].data.start;

      const entityMap = createEntityMap(splitBlocks);
      const splitEditorState = EditorState.set(
        EditorState.createWithContent(
          convertFromRaw({
            blocks: splitBlocks,
            entityMap,
          }),
          decorator
        ),
        {
          selection: editorState.getSelection(),
          undoStack: editorState.getUndoStack(),
          redoStack: editorState.getRedoStack(),
          lastChangeType: editorState.getLastChangeType(),
          allowUndo: true,
        }
      );

      // const prevEditorState = this.state.editors[editorIndex].editorState;
      this.setState(
        {
          editors: [
            ...this.state.editors.slice(0, editorIndex),
            {
              editorState: splitEditorState,
              key,
              previewState: createPreview(editorState),
            },
            ...this.state.editors.slice(editorIndex + 1),
          ],
        },
        () => this.saveState(prevEditorState, splitEditorState)
      );
    } else {
      let newEditorState = editorState;

      if (
        contentChange === 'backspace-character' &&
        blocks.length < prevEditorState.getCurrentContent().getBlocksAsArray().length
      ) {
        // console.log('JOIN');
        const currentContent = editorState.getCurrentContent();
        const rawBlocks = createRaw(currentContent.getBlocksAsArray(), currentContent);
        const blockIndex = rawBlocks.findIndex(({ key }) => key === blockKey);

        // console.log(JSON.stringify(rawBlocks[blockIndex]));
        this.setState({ playheadBlockKey: rawBlocks[blockIndex].key });

        rawBlocks[blockIndex].data.start =
          rawBlocks[blockIndex].entityRanges.length > 0
            ? rawBlocks[blockIndex].entityRanges[0].start
            : rawBlocks[blockIndex].data.start;
        rawBlocks[blockIndex].data.end =
          rawBlocks[blockIndex].entityRanges.length > 0
            ? rawBlocks[blockIndex].entityRanges[rawBlocks[blockIndex].entityRanges.length - 1].end
            : rawBlocks[blockIndex].data.end;

        // console.log(rawBlocks[blockIndex]);
        const entityMap = createEntityMap(rawBlocks);

        // const contentState = convertFromRaw({
        //   blocks: rawBlocks,
        //   entityMap,
        // });

        // newEditorState = EditorState.push(editorState, contentState, 'change-block-data');

        // const selectionState = SelectionState.createEmpty(blockKey);
        // var updatedSelection = selectionState.merge({
        //   focusKey: blockKey,
        //   focusOffset: 0,
        // });
        // const selectionStateWithNewFocusOffset = selectionState.set('focusOffset', 1);
        // newEditorState = EditorState.acceptSelection(newEditorState, selectionStateWithNewFocusOffset);

        newEditorState = EditorState.set(
          EditorState.createWithContent(
            convertFromRaw({
              blocks: rawBlocks,
              entityMap,
            }),
            decorator
          ),
          {
            selection: editorState.getSelection(),
            undoStack: editorState.getUndoStack(),
            redoStack: editorState.getRedoStack(),
            lastChangeType: editorState.getLastChangeType(),
            allowUndo: true,
          }
        );
      }

      // const prevEditorState = this.state.editors[editorIndex].editorState;
      this.setState(
        {
          blockKey,
          editors: [
            ...this.state.editors.slice(0, editorIndex),
            { editorState: newEditorState, key, previewState: createPreview(newEditorState) },
            ...this.state.editors.slice(editorIndex + 1),
          ],
        },
        () => this.saveState(prevEditorState, newEditorState)
      );
    }
  };

  saveState = (editorStateA, editorStateB) => {
    const changes = this.getSegmentChanges(editorStateA, editorStateB);

    if (!changes || changes.length === 0) return;
    console.log({ changes });

    this.setState({ blockNavigation: true });
    this.debouncedSave();
  };

  save = async () => {
    const changes = this.getChanges(this.state.prevEditors).map((block, i, arr) => {
      if (i > 0) {
        const prevBlock = arr[i - 1];
        return { ...block, start: block.start ?? prevBlock.start, end: block.end ?? block.start ?? prevBlock.start };
      }
      return { ...block, end: block.end ?? block.start };
    });

    console.log({ allChanges: changes });
    if (!changes || changes.length === 0) {
      this.setState({ blockNavigation: false });
      return;
    }

    if (changes.length > 1) this.hide = message.loading('Saving in progress…', 0);

    this.setState({ saving: true });

    const blocks = this.state.editors.reduce(
      (acc, { editorState }) => [
        ...acc,
        ...editorState
          .getCurrentContent()
          .getBlocksAsArray()
          .filter(({ type }) => type !== 'waveform')
          .map(b => b.getKey()),
      ],
      []
    );

    await updateTranscript(this.props.transcript, blocks, changes);
    this.setState({ saving: false, blockNavigation: false, prevEditors: this.state.editors });
    this.hide && this.hide();
  };

  getChanges = (prevEditors = []) => {
    const { editors } = this.state;

    const changes = editors.reduce((acc, { editorState: editorStateB, key: bKey }) => {
      const editorA = prevEditors.find(({ key }) => key === bKey);
      const editorStateA = editorA ? editorA.editorState : null;
      const segmentChanges = this.getSegmentChanges(editorStateA, editorStateB);
      return segmentChanges.length > 0 ? [...acc, ...segmentChanges] : acc;
    }, []);

    return changes;
  };

  getSegmentChanges = (editorStateA, editorStateB) => {
    const blocksA = editorStateA && editorStateA.getCurrentContent().getBlocksAsArray();
    const blocksB = editorStateB.getCurrentContent().getBlocksAsArray();

    const changeSet = blocksB
      .filter(block => block.getType() !== 'waveform')
      .reduce((acc, block) => {
        const key = block.getKey();
        const blockA = editorStateA && blocksA.find(blockA => blockA.getKey() === key);

        // console.log({ block, blockA });

        if (
          !blockA ||
          block.getText() !== blockA.getText() ||
          block.getData().get('speaker') !== blockA.getData().get('speaker') ||
          block.getData().get('status') !== blockA.getData().get('status')
        )
          return [...acc, block];
        return [...acc];
      }, []);

    return changeSet.length === 0
      ? []
      : createRaw(changeSet, editorStateB.getCurrentContent()).map(
          ({ key, text, data: { start, end, speaker, status }, entityRanges }) => {
            const entityData = {};
            entityRanges.forEach(entity =>
              Object.keys(entity).forEach(key =>
                entityData[key] ? entityData[key].push(entity[key]) : (entityData[key] = [entity[key]])
              )
            );

            const { start: starts, end: ends, offset: offsets, length: lengths, key: keys } = entityData;

            return {
              key,
              start,
              end,
              speaker,
              text,
              starts,
              ends,
              offsets,
              lengths,
              keys,
              status,
            };
          }
        );
  };

  loadTranscript = async id => {
    this.setState({ loading: true });

    // try {
    const { data: transcript } = await getTranscript(id);
    console.log(transcript);

    const { blocks, status } = transcript;
    if (!blocks || blocks.length === 0) {
      this.setState({ loading: false, import: true });
      return;
    }

    const readOnly = status === 'aligning' || status === 'aligned';

    const editors = chunk(blocks, 10).map(segments => {
      const blocks = segments
        .filter(segment => !!segment) // TODO: same fix on save
        .map(
          ({
            text,
            start,
            end,
            speaker,
            SK: key,
            starts = [],
            ends = [],
            keys = [],
            offsets = [],
            lengths = [],
            status,
          }) => {
            // const i = (start * 2 * waveform.sample_rate) / waveform.samples_per_pixel / 1e3;
            // const j = (end * 2 * waveform.sample_rate) / waveform.samples_per_pixel / 1e3;
            // const segment = waveform.data.slice(i, j);
            // const min = Math.min(...segment);
            // const max = Math.max(...segment);

            // // console.log(start, end, segment, min, max);

            // const wave = segment.map(v => (v === 0 ? 0 : v > 0 ? v / max : -v / min)).map(wavefont);
            return {
              text,
              key: key.substring('v0_block:'.length),
              type: 'paragraph',
              data: { start, end, speaker: speaker ?? '', status },
              // entityRanges: [],
              entityRanges: keys.map((key, i) => {
                return {
                  start: starts[i],
                  end: ends[i],
                  offset: offsets[i],
                  length: lengths[i],
                  key,
                };
              }),
              inlineStyleRanges: [],
            };
          }
        )
        .reduce((acc, block, index, blocks) => {
          if (block.entityRanges.length === 0) block.entityRanges = [{ offset: 0, length: 1 }];
          if (index < 1 || !WAVE) return [...acc, block];
          // const { start: end } = block.data;
          // const {
          //   data: { end: start },
          //   key,
          // } = blocks[index - 1];

          // const i = (start * 2 * waveform.sample_rate) / waveform.samples_per_pixel / 1e3;
          // const j = (end * 2 * waveform.sample_rate) / waveform.samples_per_pixel / 1e3;
          // const segment = waveform.data.slice(i, j);

          // const min = Math.min(...segment);
          // const max = Math.max(...segment);

          // const text = segment.map(v => (v === 0 ? 0 : v > 0 ? v / max : -v / min)).map(wavefont);

          // const chunkSize = 2;
          // const waveblock = {
          //   text: text.join(''),
          //   key: `wave-${key}`,
          //   type: 'waveform',
          //   data: { start, end },
          //   // entityRanges: [],
          //   entityRanges: chunk(text, chunkSize).map((key, i) => {
          //     return {
          //       start: start + (1e3 * i * waveform.samples_per_pixel) / waveform.sample_rate,
          //       end: start + (1e3 * (i + 1) * waveform.samples_per_pixel) / waveform.sample_rate,
          //       offset: i * chunkSize,
          //       length: chunkSize,
          //       key: generateId(),
          //     };
          //   }),
          //   inlineStyleRanges: [],
          // };

          // return [...acc, waveblock, block];
        }, []);
      // ???
      // .reduce((acc, block, index, blocks) => {
      //   if (index < 1) return [...acc, block];
      //   const { start: end } = block.data;
      //   const {
      //     data: { end: start },
      //     key,
      //   } = blocks[index - 1];

      //   const i = (start * 2 * waveform.sample_rate) / waveform.samples_per_pixel / 1e3;
      //   const j = (end * 2 * waveform.sample_rate) / waveform.samples_per_pixel / 1e3;
      //   const segment = waveform.data.slice(i, j);

      //   const min = Math.min(...segment);
      //   const max = Math.max(...segment);

      //   const text = segment.map(v => (v === 0 ? 0 : v > 0 ? v / max : -v / min)).map(wavefont);

      //   const chunkSize = 2;
      //   const waveblock = {
      //     text: text.join(''),
      //     key: `wave-${key}`,
      //     type: 'waveform',
      //     data: { start, end },
      //     // entityRanges: [],
      //     entityRanges: chunk(text, chunkSize).map((key, i) => {
      //       return {
      //         start: start + (1e3 * i * waveform.samples_per_pixel) / waveform.sample_rate,
      //         end: start + (1e3 * (i + 1) * waveform.samples_per_pixel) / waveform.sample_rate,
      //         offset: i * chunkSize,
      //         length: chunkSize,
      //         key: generateId(),
      //       };
      //     }),
      //     inlineStyleRanges: [],
      //   };

      //   return [...acc, waveblock, block];
      // }, []);

      const editorState = EditorState.set(
        EditorState.createWithContent(convertFromRaw({ blocks, entityMap: createEntityMap(blocks) }), decorator),
        { allowUndo: true }
      );

      // console.log(blocks);

      return {
        editorState,
        key: `editor-${blocks[0].key}`,
        previewState: createPreview(editorState),
      };
    });

    const speakers = [...new Set(blocks.filter(block => !!block).map(b => b.speaker))].filter(s => !!s && s !== '');

    const playheadEditorKey = editors[0].key;
    const playheadBlock = editors[0].editorState.getCurrentContent().getBlocksAsArray()[0];
    const playheadBlockKey = playheadBlock.getKey();

    const playheadEntity = [
      ...new Set(
        playheadBlock
          .getCharacterList()
          .toArray()
          .map(character => character.getEntity())
      ),
    ].filter(value => !!value)[0];

    const { key: playheadEntityKey, start } = editors[0].editorState
      .getCurrentContent()
      .getEntity(playheadEntity)
      .getData();

    if (this.props.player && start) this.props.player.currentTime = start / 1e3;

    this.setState({
      readOnly,
      title: transcript.title,
      editors,
      speakers,
      loading: false,
      prevEditors: editors,
      playheadEditorKey,
      playheadBlockKey,
      playheadEntityKey,
    });
    // } catch (e) {
    //   console.log(e);
    //   this.setState({ loading: false, message: 'error loading transcript' });
    // }
  };

  onPaste = (text, key) => {
    const editor = this.state.editors.find(editor => editor.key === key);
    const editorState = editor.editorState;

    const blockKey = editorState.getSelection().getStartKey();
    const blocks = editorState.getCurrentContent().getBlocksAsArray();
    const block = blocks.find(block => block.getKey() === blockKey);
    const data = block.getData();
    console.log(data);

    const blockMap = ContentState.createFromText(text).blockMap;
    const newState = Modifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      blockMap
    );

    const newState2 = Modifier.setBlockData(newState, editorState.getSelection(), data);

    this.onChange(EditorState.push(editorState, newState2, 'insert-fragment'), key);

    return 'handled';
  };

  renderEditor = ({ editorState, key, previewState }) => {
    return (
      <section key={`s-${key}`} data-editor-key={key}>
        <VisibilitySensor intervalCheck={false} scrollCheck={true} partialVisibility={true}>
          {({ isVisible }) => (
            <Editor
              editorKey={key}
              readOnly={!isVisible || this.state.readOnly || this.state.overtyperVisible}
              stripPastedStyles
              editorState={isVisible ? editorState : previewState}
              blockRendererFn={this.customBlockRenderer}
              onChange={editorState => this.onChange(editorState, key)}
              ref={ref => this.setDomEditorRef(key, ref)}
              handleDrop={() => true}
              handleDroppedFiles={() => true}
              handlePastedFiles={() => true}
              handlePastedText={text => this.onPaste(text, key)}
            />
          )}
        </VisibilitySensor>
      </section>
    );
  };

  handleBlockNavigation = () => {
    this.hide = message.loading('Saving in progress…', 0);
    return 'You have unsaved changes, are you sure you want to leave?';
  };

  exportFilesHandleOk = e => {
    const blocks = this.state.editors.reduce(
      (acc, { editorState }) => [
        ...acc,
        ...editorState
          .getCurrentContent()
          .getBlocksAsArray()
          .filter(({ type }) => type !== 'waveform'),
      ],
      []
    );

    exportTranscript(this.props.transcript, this.state.title, '', blocks, this.state.exportValue);

    this.setState({ exportFilesModalVisible: false });
  };

  render() {
    const {
      message,
      loading,
      editors,
      playheadEditorKey,
      playheadBlockKey,
      playheadEntityKey,
      playheadWindow,
      blockNavigation,
      textWindow,
      match,
      overtyperVisible,
    } = this.state;

    if (loading || !editors)
      return (
        <Content
          style={{
            background: '#fff',
          }}
        >
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>{message}</span>}>
            {loading ? <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} /> : null}
          </Empty>
        </Content>
      );

    return (
      <Content
        style={{
          background: '#fff',
        }}
      >
        <Prompt when={blockNavigation} message={this.handleBlockNavigation} />
        <BackTop />
        <article>
          <div onClick={event => this.handleClick(event)}>
            <style scoped>
              {`section[data-editor-key="${playheadEditorKey}"] ~ section .WrapperBlock div[data-offset-key] > span { font-weight: normal; color: #31465fcf !important; }`}
              {`div[data-offset-key="${playheadBlockKey}-0-0"] ~ div > .WrapperBlock div[data-offset-key] > span { font-weight: normal; color: #31465fcf !important;}`}
              {`span[data-entity-key="${playheadEntityKey}"] ~ span[data-entity-key] { font-weight: normal; color: #31465fcf !important;}`}
              {playheadWindow && overtyperVisible
                ? playheadWindow.map(key => `span[data-entity-key="${key}"] { font-weight: 700; }`)
                : null}
            </style>
            {editors.map((editorState, index) => this.renderEditor(editorState))}
          </div>
        </article>
        <Row type="flex">
          <Col span={8}></Col>
          <Col span={8}>
            <Affix offsetBottom={16} type="flex" align="center">
              <div>
                <Button
                  type="primary"
                  icon="robot"
                  size="large"
                  shape="round"
                  style={{ width: 168, margin: 4 }}
                  onClick={() => this.setState({ overtyperVisible: true })}
                >
                  OverTyper
                </Button>
                <Drawer
                  destroyOnClose
                  title={match ? <CorrectionWindow correctablePlayedWords={textWindow} match={match} /> : 'OverTyper'}
                  placement={'bottom'}
                  closable={true}
                  mask={false}
                  onClose={() =>
                    this.setState({
                      overtyperVisible: false,
                      match: null,
                      overtype: '',
                    })
                  }
                  visible={this.state.overtyperVisible}
                  height={'128'}
                  afterVisibleChange={visible => {
                    if (visible) this.overtyperRef.focus();
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Input
                      ref={ref => (this.overtyperRef = ref)}
                      value={this.state.overtype}
                      addonAfter={<Icon type="audio" />}
                      placeholder="Type or speak your correction and press return. (The audio will pause automatically)"
                      onChange={this.handleOvertyperInput}
                      onPressEnter={this.applyOvertyper}
                    />
                  </div>
                </Drawer>
              </div>
            </Affix>
          </Col>

          <Col span={8}>
            <Affix className="controls-holder" offsetBottom={16} type="flex" align="right">
              <div>
                <Tooltip placement="topLeft" title="Find / Replace" arrowPointAtCenter>
                  <Button
                    className="action-button"
                    type="primary"
                    shape="circle"
                    icon="file-search"
                    size="large"
                    onClick={() => this.setState({ findReplaceVisible: true })}
                  />
                </Tooltip>

                <Tooltip placement="topLeft" title="Export" arrowPointAtCenter>
                  <Button
                    className="action-button"
                    type="primary"
                    shape="circle"
                    icon="export"
                    size="large"
                    onClick={() => this.setState({ exportFilesModalVisible: true })}
                  />
                </Tooltip>
              </div>
            </Affix>
          </Col>
        </Row>

        <Drawer
          title="Find / Replace"
          placement={'bottom'}
          closable={true}
          mask={false}
          onClose={() => this.setState({ findReplaceVisible: false })}
          visible={this.state.findReplaceVisible}
          height={'128'}
        >
          <Form layout="inline" onSubmit={this.handleSubmit} type="flex" align="center">
            <Form.Item>
              <Input prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Find" />
            </Form.Item>
            <Form.Item>
              <Input prefix={<Icon type="retweet" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Replace" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Go
              </Button>
            </Form.Item>
          </Form>
        </Drawer>

        <Modal
          title="Export transcripts"
          visible={this.state.exportFilesModalVisible}
          onOk={this.exportFilesHandleOk}
          onCancel={() => this.setState({ exportFilesModalVisible: false })}
        >
          <p>Select format:</p>
          <RadioGroup onChange={e => this.setState({ exportValue: e.target.value })} value={this.state.exportValue}>
            <Radio style={radioStyle} value={0}>
              {' '}
              Text Document
            </Radio>
            <Radio style={radioStyle} value={1}>
              {' '}
              Word Document
            </Radio>
            <Radio style={radioStyle} value={2} disabled>
              {' '}
              JSON Format (contains timings and other meta data)
            </Radio>
            <Radio style={radioStyle} value={3} disabled>
              {' '}
              Interactive Transcript
            </Radio>
          </RadioGroup>
        </Modal>
      </Content>
    );
  }
}

const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

const getEntityStrategy = mutability => (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey && contentState.getEntity(entityKey).getMutability() === mutability;
  }, callback);
};

const decorator = new CompositeDecorator([
  {
    strategy: getEntityStrategy('MUTABLE'),
    component: ({ entityKey, contentState, children }) => {
      const data = entityKey ? contentState.getEntity(entityKey).getData() : {};
      return (
        <span data-start={data.start} data-entity-key={data.key} className="Token">
          {children}
        </span>
      );
    },
  },
]);

const createPreview = editorState =>
  EditorState.set(
    EditorState.createWithContent(
      convertFromRaw({
        blocks: convertToRaw(editorState.getCurrentContent()).blocks.map(block => ({
          ...block,
          entityRanges: [],
          inlineStyleRanges: [],
        })),
        entityMap: {},
      }),
      decorator
    ),
    { allowUndo: false }
  );

const createEntityMap = blocks =>
  flatten(blocks.map(block => block.entityRanges)).reduce(
    (acc, data) => ({
      ...acc,
      [data.key]: { type: 'TOKEN', mutability: 'MUTABLE', data },
    }),
    {}
  );

const createRaw = (blocks, contentState) =>
  blocks.map(block => {
    const key = block.getKey();
    const type = block.getType();
    const text = block.getText();
    const data = block.getData().toJS();

    const entityRanges = [];
    block.findEntityRanges(
      character => !!character.getEntity(),
      (start, end) =>
        entityRanges.push({
          offset: start,
          length: end - start,
        })
    );

    return {
      key,
      type,
      text,
      data,
      entityRanges: entityRanges.map(({ offset, length }) => {
        const entityKey = block.getEntityAt(offset);
        const entity = contentState.getEntity(entityKey);
        return {
          ...entity.getData(),
          offset,
          length,
        };
      }),
      inlineStyleRanges: [],
    };
  });

const SPAN_TYPES = {
  MATCH_START: 'match_start',
  MATCH_END: 'match_end',
  REPLACED: 'replaced',
  REPLACEMENT: 'replacement',
};

const CorrectionWindow = ({ correctablePlayedWords, match }) => {
  if (match) {
    const words = correctablePlayedWords.map(word => word.text);

    const parts = [];

    if (match) {
      parts.push(words.slice(0, match.start.index).join(' '));
      parts.push(
        <span className={SPAN_TYPES.MATCH_START} key="match_start">
          {words.slice(match.start.index, match.start.index + match.start.length).join(' ')}
        </span>
      );

      if (match.replacement) {
        if (match.end) {
          parts.push(
            <span className={SPAN_TYPES.REPLACED} key="replaced">
              {words.slice(match.start.index + match.start.length, match.end.index).join(' ')}
            </span>
          );
          parts.push(
            <span className={SPAN_TYPES.REPLACEMENT} key="replacement">
              {match.replacement}
            </span>
          );
          parts.push(
            <span className={SPAN_TYPES.MATCH_END} key="match_end">
              {words.slice(match.end.index, match.end.index + match.end.length).join(' ')}
            </span>
          );
          parts.push(words.slice(match.end.index + match.end.length).join(' '));
        } else {
          parts.push(
            <span className={SPAN_TYPES.REPLACEMENT} key="replacement">
              {match.replacement}
            </span>
          );
          parts.push(words.slice(match.start.index + match.start.length).join(' '));
        }
      } else {
        parts.push(words.slice(match.start.index + match.start.length, words.length).join(' '));
      }
    } else {
      parts.push(words.join(' '));
    }

    return (
      <span className="transcriptDisplay--played_correctable">{parts.reduce((prev, curr) => [prev, ' ', curr])}</span>
    );
  }

  return (
    <span className="transcriptDisplay--played_correctable">
      {correctablePlayedWords.map(word => word.text).join(' ')}
    </span>
  );
};

export default TranscriptEditor;

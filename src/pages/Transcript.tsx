/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useMemo, useState, useCallback, useEffect, useRef, MutableRefObject } from 'react';
import { useParams } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import { useAtom } from 'jotai';
import Draggable from 'react-draggable';
import ReactPlayer from 'react-player';
import { Layout, Col, Row, PageHeader, Drawer, BackTop } from 'antd';
import axios from 'axios';
import { EditorState, ContentState, RawDraftContentBlock } from 'draft-js';

import { Editor, convertFromRaw, createEntityMap } from '../components/editor';
import { User, Transcript } from '../models';
import { playerPositionAtom } from '../atoms';
import StatusCard, { StatusTag } from '../components/StatusCard';
import DataCard from '../components/DataCard';

const { Content } = Layout;

interface TranscriptPageProps {
  user: User | undefined;
  groups: string[];
  transcripts: Transcript[] | undefined;
  userMenu: JSX.Element;
}

const TranscriptPage = ({ user, groups, transcripts, userMenu }: TranscriptPageProps): JSX.Element => {
  const params = useParams();
  const { uuid } = params as Record<string, string>;

  const transcript = useMemo(() => transcripts?.find(({ id }) => id === uuid), [transcripts, uuid]);

  const [statusDrawerVisible, setStatusDrawerVisible] = useState(false);
  const openStatusDrawer = useCallback(() => setStatusDrawerVisible(true), []);
  const closeStatusDrawer = useCallback(() => setStatusDrawerVisible(false), []);

  const [data, setData] = useState<{ speakers: { [key: string]: any }; blocks: RawDraftContentBlock[] }>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    (async () => {
      setData((await axios.get(await Storage.get(`transcript/${uuid}/transcript.json`, { level: 'public' }))).data);
    })();
  }, [uuid]);

  const [speakers, setSpeakers] = useState({});
  const { blocks } = data ?? {};

  const initialState = useMemo(
    () => blocks && EditorState.createWithContent(convertFromRaw({ blocks, entityMap: createEntityMap(blocks) })),
    [blocks],
  );

  const setDraft = useCallback(
    (state: {
      speakers: {
        [key: string]: any;
      };
      blocks: RawDraftContentBlock[];
      contentState: ContentState;
    }) => {
      console.log('TODO setDraft');
    },
    [],
  );

  const [time, setTime] = useState(0);

  const noKaraoke = false;
  const seekTo = (time: number): void => {
    console.log('TODO seekTo', time);
  };
  const [playing, setPlaying] = useState(false);
  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);

  const audioKey = useMemo(() => {
    if (!transcript) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { steps } = (transcript.status as unknown as Record<string, any>) ?? { step: 0, steps: [] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transcodeIndex = steps.findIndex((step: any) => step.type === 'transcode');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (steps[transcodeIndex] as any)?.data?.audio?.key;
  }, [transcript]);

  return (
    <Layout>
      <PageHeader
        className="site-page-header"
        title={transcript?.title ?? uuid}
        subTitle={
          <div style={{ display: 'inline-block' }} onClick={openStatusDrawer}>
            {transcript ? <StatusTag transcript={transcript} /> : null}
          </div>
        }
        extra={userMenu}
      />
      <Player {...{ audioKey, playing, play, pause, setTime }} />
      <Content>
        <Row>
          <Col span={19} offset={3}>
            <p>
              {time} : {playing ? 'playing' : 'paused'}
            </p>
            {initialState ? (
              <Editor
                {...{ initialState, time, seekTo, speakers, setSpeakers, playing, play, pause }}
                autoScroll
                onChange={setDraft}
                playheadDecorator={noKaraoke ? null : undefined}
              />
            ) : error ? (
              <p>Error: {error?.message}</p>
            ) : (
              <p>TODO skeleton loader</p>
            )}
          </Col>
        </Row>
      </Content>
      <BackTop />
      <Drawer
        destroyOnClose
        title={transcript?.title}
        placement="right"
        onClose={closeStatusDrawer}
        visible={statusDrawerVisible}
        width={600}>
        {transcript ? <StatusCard transcript={transcript} user={user} groups={groups} /> : null}
      </Drawer>
      <DataCard objects={{ transcript }} />
    </Layout>
  );
};

const Player = ({
  audioKey,
  playing,
  play,
  pause,
  setTime,
}: {
  audioKey: string | null;
  playing: boolean;
  play: () => void;
  pause: () => void;
  setTime: (t: number) => void;
}): JSX.Element | null => {
  const audio = true;

  const [position, setPosition] = useAtom(playerPositionAtom);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    audioKey &&
      (async () =>
        setUrl(
          await Storage.get(audioKey.replace('public/', ''), {
            download: false,
            expires: 36000,
          }),
          // 'https://stream.hyper.audio/q3xsh/hls/YCCJ4HtHr4jy2Dxxr5wf2U/video.m3u8',
          // 'https://stream.hyper.audio/q3xsh/input/YCCJ4HtHr4jy2Dxxr5wf2U/video.mp4',
        ))();
  }, [audioKey]);

  // console.log(url);

  const handleDragStop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any, data: any) => {
      const { x, y } = data;
      setPosition({ x, y });
    },
    [setPosition],
  );

  const config = useMemo(
    () => ({
      forceAudio: audio,
      forceVideo: !audio,
      file: {
        attributes: {
          // poster: 'https://via.placeholder.com/720x576.png?text=4:3',
          controlsList: 'nodownload',
        },
        // hlsOptions: {
        //   backBufferLength: 30,
        //   maxMaxBufferLength: 30,
        // },
      },
    }),
    [audio],
  );

  const ref = useRef<ReactPlayer>() as MutableRefObject<ReactPlayer>;

  const onDuration = useCallback((duration: number) => {
    console.log({ duration });
  }, []);

  const onProgress = useCallback(
    ({ playedSeconds }: { playedSeconds: number }) => {
      console.log({ playedSeconds });
      setTime(playedSeconds);
    },
    [setTime],
  );

  return url ? (
    <Draggable defaultPosition={position} onStop={handleDragStop}>
      <div
        style={{
          width: '300px',
          backgroundColor: audio ? 'transparent' : 'black',
          padding: '4px',
          boxShadow: '0 0 15px gray',
          zIndex: 999,
          aspectRatio: audio ? '16/3' : '16/9',
        }}>
        <ReactPlayer
          controls
          {...{ ref, url, config, playing, onDuration, onProgress }}
          onPlay={play}
          onPause={pause}
          progressInterval={100}
          width="100%"
          height="100%"
        />
      </div>
    </Draggable>
  ) : null;
};

export default TranscriptPage;

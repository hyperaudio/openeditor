/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useMemo, useState, useCallback, useEffect, useRef, MutableRefObject } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import { useAtom } from 'jotai';
import { Layout, Col, Row, Drawer, FloatButton, Empty, Skeleton, Button, Space, Divider } from 'antd';
import ExportOutlined from '@ant-design/icons/ExportOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import { PageContainer } from '@ant-design/pro-components';
import axios from 'axios';
import pako from 'pako';
import { EditorState, ContentState, RawDraftContentBlock } from 'draft-js';
import TC, { FRAMERATE } from 'smpte-timecode';

import { darkModeAtom, transportAtTopAtom } from '../atoms';
import { User, Transcript, Project, Folder } from '../models';
import Player from '../components/Player';
import { Editor, convertFromRaw, createEntityMap } from '../components/editor';
import StatusCard, { StatusTag } from '../components/cards/StatusCard';
import DataCard from '../components/cards/DataCard';
import ExportCard from '../components/cards/ExportCard';
import MetadataCard from '../components/cards/MetadataCard';
import Footer from '../components/Footer';

const { Content } = Layout;

interface TranscriptPageProps {
  user: User | undefined;
  groups: string[];
  project: Project | undefined;
  projects: Project[] | undefined;
  folders: Folder[] | undefined;
  transcripts: Transcript[] | undefined;
  userMenu: JSX.Element;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routes: any[];
}

const TranscriptPage = ({
  user,
  groups,
  project,
  projects,
  folders,
  transcripts,
  userMenu,
  routes = [],
}: TranscriptPageProps): JSX.Element => {
  const history = useHistory();
  const params = useParams();
  const { uuid } = params as Record<string, string>;

  const [darkMode] = useAtom(darkModeAtom);
  const [transportAtTop] = useAtom(transportAtTopAtom);

  const transcript = useMemo(() => transcripts?.find(({ id }) => id === uuid), [transcripts, uuid]);
  const { step } = useMemo(() => {
    if (!transcript) return { step: -1, steps: [] };
    return (transcript.status as unknown as Record<string, any>) ?? { step: -1, steps: [] };
  }, [transcript]);

  const [statusDrawerVisible, setStatusDrawerVisible] = useState(false);
  const openStatusDrawer = useCallback(() => setStatusDrawerVisible(true), []);
  const closeStatusDrawer = useCallback(() => {
    // setStatusDrawerVisible(step >= 0 && step < 3);
    setStatusDrawerVisible(false);
    if (step >= 0 && step < 3) history.push(`/${transcript?.parent ?? ''}`);
  }, [step, transcript, history]);

  const [metaDrawerVisible, setMetaDrawerVisible] = useState(false);
  const openMetaDrawer = useCallback(() => setMetaDrawerVisible(true), []);
  const closeMetaDrawer = useCallback(() => setMetaDrawerVisible(false), []);

  useEffect(
    () => setStatusDrawerVisible(step >= 0 && step < 3 ? true : statusDrawerVisible),
    [step, statusDrawerVisible],
  );

  const [initialState, setInitialState] = useState<EditorState>();
  const [speakers, setSpeakers] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (step < 3) return;

    (async () => {
      try {
        const {
          data: { speakers = {}, blocks = [] },
        } = await axios.get(await Storage.get(`transcript/${uuid}/transcript.json`, { level: 'public' }));
        setSpeakers(speakers);
        setInitialState(EditorState.createWithContent(convertFromRaw({ blocks, entityMap: createEntityMap(blocks) })));
      } catch (error) {
        setError(error as Error);
      }
    })();
  }, [uuid, step]);

  const [draft, setDraft] = useState<{
    speakers: { [key: string]: any };
    blocks: RawDraftContentBlock[];
    contentState: ContentState;
  }>();

  const [saved, setSaved] = useState<{
    speakers: { [key: string]: any };
    blocks: RawDraftContentBlock[];
    contentState: ContentState;
  }>();
  // const [autoSaved, setAutoSaved] = useState();
  const [saving, setSaving] = useState(0);
  const [savingProgress, setSavingProgress] = useState(0);

  // TODO window.onbeforeunload
  const unsavedChanges = useMemo(() => draft?.contentState !== saved?.contentState, [draft, saved]);

  const handleSave = useCallback(async () => {
    if (!user || !transcript || !draft) return;
    setSavingProgress(0);
    setSaving(2);

    const data = { speakers, blocks: draft.blocks };

    // TODO make setSpeakers be useReducer and clean-up this there
    const allSpeakerIds = [...new Set(Object.keys(data.speakers))];
    const usedSpeakerIds = [...new Set(data.blocks.map(({ data: { speaker } = {} }) => speaker))];
    const unusedSpeakerIds = allSpeakerIds.filter(id => !usedSpeakerIds.includes(id));
    unusedSpeakerIds.forEach(id => delete data.speakers[id]);

    const utf8Data = new TextEncoder().encode(JSON.stringify(data));
    const jsonGz = pako.gzip(utf8Data);
    const blobGz = new Blob([jsonGz]);

    await Storage.put(`transcript/${uuid}/transcript.json`, blobGz, {
      level: 'public',
      contentType: 'application/json',
      contentEncoding: 'gzip',
      metadata: {
        user: user.id,
        language: transcript.language,
      },
      progressCallback(progress) {
        const percentCompleted = Math.round((progress.loaded * 100) / progress.total);
        setSavingProgress(percentCompleted);
      },
    });

    setSaving(1);

    // TODO update updatedAt/updatedBy in metadata

    setTimeout(() => setSaving(0), 500);
    setSaved(draft);
  }, [speakers, draft, uuid, transcript, user]);

  const [exportDrawerVisible, setExportDrawerVisible] = useState(false);
  const openExportDrawer = useCallback(() => setExportDrawerVisible(true), []);
  const closeExportDrawer = useCallback(() => setExportDrawerVisible(false), []);

  // const ref = useRef<ReactPlayer | null>() as MutableRefObject<ReactPlayer>;
  // const ref = useRef<HTMLMediaElement | HTMLVideoElement>() as MutableRefObject<HTMLMediaElement | HTMLVideoElement>;
  const seekToRef = useRef<(time: number) => void>() as MutableRefObject<(time: number) => void>;
  const [time, setTime] = useState(0);

  const noKaraoke = false;
  const seekTo = useCallback(
    (time: number) => {
      // console.log('ref.current', ref.current);
      // if ((ref.current as any).seekTo) {
      //   (ref.current as any).seekTo(time, 'seconds');
      // } else (ref.current as any).currentTime = time;
      seekToRef.current(time);
    },
    [seekToRef],
  );
  const [playing, setPlaying] = useState(false);
  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);

  const audioKey = useMemo(() => {
    if (!transcript) return null;
    const { steps } = (transcript.status as unknown as Record<string, any>) ?? { step: 0, steps: [] };
    const transcodeIndex = steps.findIndex((step: any) => step.type === 'transcode');

    return (steps[transcodeIndex] as any)?.data?.audio?.key;
  }, [transcript]);

  const aspectRatio = useMemo(() => {
    const videoStream = (transcript as any)?.status?.steps?.[0]?.data?.ffprobe?.streams.find(
      (stream: any) => stream.codec_type === 'video',
    );

    // eslint-disable-next-line dot-notation
    if (videoStream?.['display_aspect_ratio']) return videoStream?.['display_aspect_ratio']?.replace(':', '/');
    if (videoStream?.width && videoStream?.height) return `${videoStream?.width}/${videoStream?.height}`;

    return '16/9';
  }, [transcript]);

  const originalFrameRate = useMemo(() => {
    const videoStream = (transcript as any)?.status?.steps?.[0]?.data?.ffprobe?.streams.find(
      (stream: any) => stream.codec_type === 'video',
    );

    // eslint-disable-next-line dot-notation, no-eval
    if (videoStream?.['r_frame_rate']) return parseFloat(parseFloat(eval(videoStream?.['r_frame_rate'])).toFixed(2));

    return null;
  }, [transcript]);

  const frameRate = useMemo(
    () => (transcript as any)?.metadata.frameRate ?? originalFrameRate ?? 1000,
    [transcript, originalFrameRate],
  );

  const offset = useMemo(
    () => (transcript as any)?.metadata.offset ?? new TC(0, frameRate as FRAMERATE).toString(),
    [transcript, frameRate],
  );

  // console.log({ aspectRatio, frameRate });

  const itemRender = useCallback(
    (route: any, params: any, routes: any[], paths: any[]) => <Link to={route.path}>{route.breadcrumbName}</Link>,
    [],
  );

  return (
    <Layout>
      <PageContainer
        className="site-page-header"
        breadcrumb={{
          routes,
          itemRender,
        }}
        title={
          <>
            {transcript?.title ?? uuid}
            <Button type="link" size="large" icon={<EditOutlined />} onClick={openMetaDrawer} />
          </>
        }
        subTitle={
          <div style={{ display: 'inline-block' }} onClick={openStatusDrawer}>
            {transcript ? <StatusTag transcript={transcript} /> : null}
          </div>
        }
        extra={
          <Space>
            <Button
              type="primary"
              shape="round"
              disabled={step !== 3 || !draft || saving !== 0}
              loading={saving !== 0}
              onClick={handleSave}>
              {saving === 0 ? `Save` : `Saving ${savingProgress}%`}
            </Button>
            <Button shape="round" disabled={step !== 3 || !draft} icon={<ExportOutlined />} onClick={openExportDrawer}>
              Export
            </Button>
            <Divider type="vertical" />
            {userMenu}
          </Space>
        }
      />
      <div
        style={
          transportAtTop
            ? { position: 'sticky', left: 0, top: '0', width: '100%', zIndex: 1000 }
            : { position: 'fixed', left: 0, bottom: '0', width: '100%', zIndex: 1000 }
        }>
        <Player {...{ audioKey, playing, play, pause, setTime, aspectRatio, frameRate, offset }} seekTo={seekToRef} />
      </div>
      <Content>
        <Row
          style={{
            backgroundColor: darkMode ? 'black' : 'white',
            paddingTop: '3em',
            paddingBottom: '5em',
          }}>
          <Col span={20} offset={2}>
            {step < 3 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : initialState ? (
              <Editor
                {...{ initialState, time, seekTo, speakers, setSpeakers, playing, play, pause, frameRate, offset }}
                autoScroll={false}
                onChange={setDraft}
                playheadDecorator={noKaraoke ? null : undefined}
              />
            ) : error ? (
              <p>Error: {error?.message}</p>
            ) : (
              <Skeleton active paragraph={{ rows: 31 }} />
            )}
          </Col>
        </Row>
      </Content>
      <Footer />
      <FloatButton.BackTop style={{ bottom: 150 }} />
      <Drawer
        destroyOnClose
        title={transcript?.title}
        placement="right"
        onClose={closeMetaDrawer}
        open={metaDrawerVisible}
        closable
        width={600}>
        <MetadataCard {...{ transcript, user, speakers, setSpeakers, frameRate, offset }} />
      </Drawer>
      <Drawer
        destroyOnClose
        title={transcript?.title}
        placement="right"
        onClose={closeStatusDrawer}
        open={statusDrawerVisible}
        // closable={!(step < 3)}
        width={600}>
        {transcript ? <StatusCard transcript={transcript} user={user} groups={groups} /> : null}
      </Drawer>
      <Drawer
        destroyOnClose
        title="Export"
        placement="right"
        onClose={closeExportDrawer}
        open={exportDrawerVisible}
        width={600}>
        <ExportCard transcript={transcript} user={user} content={draft} />
      </Drawer>
      <DataCard objects={{ transcript }} />
    </Layout>
  );
};

export default TranscriptPage;

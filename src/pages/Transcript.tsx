/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useMemo, useState, useCallback, useEffect, useRef, MutableRefObject } from 'react';
import { useParams } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import { useAtom } from 'jotai';
import ReactPlayer from 'react-player';
import { Layout, Col, Row, PageHeader, Drawer, BackTop, Empty, Skeleton, Button, Space, Divider } from 'antd';
import ExportOutlined from '@ant-design/icons/ExportOutlined';
import axios from 'axios';
import pako from 'pako';
import { EditorState, ContentState, RawDraftContentBlock } from 'draft-js';

import { darkModeAtom } from '../atoms';
import { User, Transcript } from '../models';
import Player from '../components/Player';
import { Editor, convertFromRaw, createEntityMap } from '../components/editor';
import StatusCard, { StatusTag } from '../components/StatusCard';
import DataCard from '../components/DataCard';
import Footer from '../components/Footer';

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

  const [darkMode] = useAtom(darkModeAtom);

  const transcript = useMemo(() => transcripts?.find(({ id }) => id === uuid), [transcripts, uuid]);
  const { step, steps } = useMemo(() => {
    if (!transcript) return { step: -1, steps: [] };
    return (transcript.status as unknown as Record<string, any>) ?? { step: -1, steps: [] };
  }, [transcript]);

  const [statusDrawerVisible, setStatusDrawerVisible] = useState(false);
  const openStatusDrawer = useCallback(() => setStatusDrawerVisible(true), []);
  const closeStatusDrawer = useCallback(() => setStatusDrawerVisible(step >= 0 && step < 3), [step]);

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

  const handleExport = useCallback(async () => {
    // TODO export
  }, []);

  const ref = useRef<ReactPlayer | null>() as MutableRefObject<ReactPlayer>;
  const [time, setTime] = useState(0);

  const noKaraoke = false;
  const seekTo = useCallback((time: number) => ref.current?.seekTo(time, 'seconds'), []);
  const [playing, setPlaying] = useState(false);
  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);

  const audioKey = useMemo(() => {
    if (!transcript) return null;
    const { steps } = (transcript.status as unknown as Record<string, any>) ?? { step: 0, steps: [] };
    const transcodeIndex = steps.findIndex((step: any) => step.type === 'transcode');

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
      <Player {...{ audioKey, playing, play, pause, setTime, ref }} />
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
                {...{ initialState, time, seekTo, speakers, setSpeakers, playing, play, pause }}
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
      <BackTop />
      <Drawer
        destroyOnClose
        title={transcript?.title}
        placement="right"
        onClose={closeStatusDrawer}
        visible={statusDrawerVisible}
        closable={!(step < 3)}
        width={600}>
        {transcript ? <StatusCard transcript={transcript} user={user} groups={groups} /> : null}
      </Drawer>
      <Drawer
        destroyOnClose
        title="Export"
        placement="right"
        onClose={closeExportDrawer}
        visible={exportDrawerVisible}
        width={600}>
        <p>TODO export card</p>
      </Drawer>
      <DataCard objects={{ transcript }} />
    </Layout>
  );
};

export default TranscriptPage;

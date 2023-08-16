/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useMemo, useState, useCallback, useEffect, useRef, MutableRefObject } from 'react';
import { useParams, Link, useHistory, useLocation } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import { useAtom } from 'jotai';
import {
  Layout,
  Col,
  Row,
  Drawer,
  FloatButton,
  Empty,
  Skeleton,
  Button,
  Space,
  Divider,
  Form,
  Input,
  Dropdown,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import ExportOutlined from '@ant-design/icons/ExportOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import RetweetOutlined from '@ant-design/icons/RetweetOutlined';
import { PageContainer } from '@ant-design/pro-components';
import axios from 'axios';
import pako from 'pako';
import { EditorState, ContentState, RawDraftContentBlock } from 'draft-js';
import TC, { FRAMERATE } from 'smpte-timecode';
import { useHotkeys } from 'react-hotkeys-hook';
import MiniSearch from 'minisearch';
import { useDebounce } from 'usehooks-ts';
import useInterval from 'use-interval';

import { darkModeAtom, transportAtTopAtom } from '../atoms';
import { User, Transcript, Project, Folder, ProjectGroup } from '../models';
import Player from '../components/Player';
import { Editor, convertFromRaw, createEntityMap } from '../components/editor';
import StatusCard, { StatusTag } from '../components/cards/StatusCard';
import DataCard from '../components/cards/DataCard';
import ExportCard from '../components/cards/ExportCard';
import MetadataCard from '../components/cards/MetadataCard';
import Footer from '../components/Footer';

import type { MenuProps } from 'antd';

const { Content } = Layout;

const useQuery = (): URLSearchParams => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

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
  const query = useQuery();
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
  const debouncedUnsavedChanges = useDebounce(unsavedChanges, 1e4);

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
        // autosave: autosave ? 'true' : 'false',
      },
      progressCallback(progress) {
        const percentCompleted = Math.round((progress.loaded * 100) / progress.total);
        setSavingProgress(percentCompleted);
      },
    });

    // save index
    try {
      const miniSearch = new MiniSearch({
        fields: ['text'],
        storeFields: ['speaker', 'start', 'end'],
      });

      miniSearch.addAll(
        draft.blocks.map(({ key: id, text, data }) => ({
          id,
          text,
          speaker: speakers[data?.speaker]?.name ?? '',
          start: data?.start ?? 0,
          end: data?.end ?? 0,
        })),
      );

      await Storage.put(
        `transcript/${uuid}/index.json`,
        new Blob([pako.gzip(new TextEncoder().encode(JSON.stringify(miniSearch)))]),
        {
          level: 'public',
          contentType: 'application/json',
          contentEncoding: 'gzip',
        },
      );
    } catch (ignored) {
      console.log(ignored);
    }
    // end save index

    setSaving(1);

    // TODO update updatedAt/updatedBy in metadata

    setTimeout(() => setSaving(0), 500);
    setSaved(draft);
  }, [speakers, draft, uuid, transcript, user]);

  const autoSave = useCallback(() => {
    if (!unsavedChanges || saving !== 0) return;
    if (saved === undefined) {
      setSaved(draft);
    } else handleSave(); // TODO tag metadata on autosave
  }, [saving, unsavedChanges, draft, saved, handleSave]);

  useInterval(() => {
    autoSave();
  }, 30 * 1e3);

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

  const blockKey = useMemo(() => query.get('block'), [query]);
  // const search = useMemo(() => query.get('search'), [query]);
  const [foundBlockKey, setFoundBlockKey] = useState<string | null>(null);

  useEffect(() => {
    if (!blockKey || !draft) return;
    setTimeout(() => {
      const block = draft.blocks.find(({ key }) => key === blockKey);

      if (!block) return;
      seekTo(block?.data?.start ?? 0);

      const blockEl = document.querySelector(`*[data-offset-key="${blockKey}-0-0"]`);

      if (blockEl && !foundBlockKey) {
        setFoundBlockKey(blockKey);
        blockEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (blockEl as any)?.style.setProperty('outline', '2px solid #1890ff');
        setTimeout(() => {
          (blockEl as any)?.style.setProperty('outline', 'none');
        }, 5000);
      }
    }, 1000);
  }, [blockKey, draft, seekTo, foundBlockKey]);

  const [searchDrawerVisible, setSearchDrawerVisible] = useState(false);

  useHotkeys('ctrl+space', () => (playing ? pause() : play()), [playing, play, pause]);

  const itemRender = useCallback((route: any, params: any, routes: any[], paths: any[]) => {
    if (route.projectGroups && route.projectGroups.length > 0) {
      const items: MenuProps['items'] = route.projectGroups.map((projectGroup: ProjectGroup, i: number) => ({
        key: `${i + 1}`,
        label: <Link to={`/${projectGroup.id}`}>{projectGroup.title}</Link>,
      }));

      return (
        <Dropdown menu={{ items }}>
          <a onClick={e => e.preventDefault()}>
            <Space>
              {route.breadcrumbName}
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      );
    }
    return <Link to={route.path}>{route.breadcrumbName}</Link>;
  }, []);

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
      <FloatButton.Group style={{ right: 94 }}>
        <FloatButton.BackTop style={{ bottom: 150 }} />
        <FloatButton icon={<SearchOutlined />} type="primary" onClick={() => setSearchDrawerVisible(true)} />
      </FloatButton.Group>
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
      <Drawer
        destroyOnClose
        // title="Seard & Replace"
        placement="bottom"
        onClose={() => setSearchDrawerVisible(false)}
        open={searchDrawerVisible}
        closable={false}
        height="auto">
        <FindReplace />
      </Drawer>
      <DataCard objects={{ transcript }} />
    </Layout>
  );
};

const FindReplace = (): JSX.Element => {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');

  return (
    <Form
      layout="inline"
      // onSubmit={console.log}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Form.Item>
        <Input
          value={find}
          prefix={<SearchOutlined />}
          placeholder="Find"
          onChange={({ target: { value } }) => setFind(value)}
        />
      </Form.Item>
      <Form.Item>
        <Input
          value={replace}
          prefix={<RetweetOutlined />}
          placeholder="Replace"
          onChange={({ target: { value } }) => setReplace(value)}
        />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Find
          </Button>
          <Button type="primary" disabled={false} onClick={console.log}>
            Replace
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TranscriptPage;

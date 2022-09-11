/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import { useAtom } from 'jotai';
import Draggable from 'react-draggable';
import ReactPlayer from 'react-player';
import { Layout, Col, Row, PageHeader, Drawer, BackTop } from 'antd';

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
      <Player audioKey={audioKey} />
      <Content>
        <Row>
          <Col span={12} offset={6}>
            EDITOR
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

const Player = ({ audioKey }: { audioKey: string | null }): JSX.Element | null => {
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
        ))();
  }, [audioKey]);

  const handleDragStop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any, data: any) => {
      const { x, y } = data;
      setPosition({ x, y });
    },
    [setPosition],
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
        <ReactPlayer controls width="100%" height="100%" url={url} />
      </div>
    </Draggable>
  ) : null;
};

export default TranscriptPage;

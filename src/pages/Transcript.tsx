import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ReactJson from 'react-json-view';
import { Layout, Col, Row, PageHeader, Card } from 'antd';

import { User, Transcript } from '../models';
import StatusCard from '../components/StatusCard';

const { Content } = Layout;

interface TranscriptPageProps {
  user: User | undefined;
  groups: string[];
  transcripts: Transcript[] | undefined;
  userMenu: JSX.Element;
  darkMode: boolean;
  debug: boolean;
}

const TranscriptPage = ({ user, groups, transcripts, userMenu, darkMode, debug }: TranscriptPageProps): JSX.Element => {
  const params = useParams();
  const { uuid } = params as Record<string, string>;

  const transcript = useMemo(() => transcripts?.find(({ id }) => id === uuid), [transcripts, uuid]);

  return (
    <Layout>
      <PageHeader className="site-page-header" title={transcript?.title ?? uuid} subTitle={uuid} extra={userMenu} />
      <Content
        style={
          {
            /* minHeight: '100vh' */
          }
        }>
        <Row>
          <Col span={12} offset={6}>
            {transcript && <StatusCard {...{ user, groups, transcript }} />}
          </Col>
        </Row>
      </Content>
      {debug && (
        <Card title="Data" size="small" style={{ minWidth: '50vw', maxWidth: '75vw', margin: '2em auto' }}>
          <ReactJson
            name="transcripts"
            iconStyle="circle"
            collapsed
            quotesOnKeys={false}
            displayDataTypes={false}
            displayObjectSize={false}
            src={transcript ?? {}}
            theme={darkMode ? 'summerfruit' : 'summerfruit:inverted'}
          />
        </Card>
      )}
    </Layout>
  );
};

export default TranscriptPage;

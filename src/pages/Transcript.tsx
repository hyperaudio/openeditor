import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Col, Row, PageHeader, Card } from 'antd';

import { User, Transcript } from '../models';
import StatusCard from '../components/StatusCard';
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
      <DataCard objects={{ transcript }} />
    </Layout>
  );
};

export default TranscriptPage;

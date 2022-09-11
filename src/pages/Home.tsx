/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { DataStore } from 'aws-amplify';
import Moment from 'react-moment';
import 'moment-timezone';
import { Layout, PageHeader, Table, Typography, Drawer, BackTop } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { User, Transcript } from '../models';
import StatusCard, { StatusTag, StatusBadge } from '../components/StatusCard';
import DataCard from '../components/DataCard';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

interface HomeProps {
  user: User | undefined;
  groups: string[];
  userMenu: JSX.Element;
  transcripts: Transcript[] | undefined;
}

const Home = ({ user, groups, transcripts = [], userMenu }: HomeProps): JSX.Element => {
  const history = useHistory();

  const [statusDrawerVisible, setStatusDrawerVisible] = useState(false);
  const [statusDrawerTranscript, setStatusDrawerTranscript] = useState<Transcript | null>(null);

  const openStatusDrawer = useCallback((transcript: Transcript) => {
    setStatusDrawerTranscript(transcript);
    setStatusDrawerVisible(true);
  }, []);
  const closeStatusDrawer = useCallback(() => {
    setStatusDrawerVisible(false);
    // setStatusDrawerTranscript(null); // TODO: keep while uploading only
  }, []);

  const columns = useMemo(
    (): ColumnsType<Transcript> => [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: '33%',
        render: (title: string, record: Transcript) => (
          <span>
            <Link to={`/${record.id}`}>
              <Text>{title}</Text>
            </Link>
          </span>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (status: any, record) => (
          <div style={{ display: 'inline-block' }} onClick={() => openStatusDrawer(record)}>
            <StatusTag transcript={record} />
          </div>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // render: (status: any, record) => <StatusBadge transcript={record} />,
      },
      {
        title: (
          <span>
            Last modified <small>(ago)</small>
          </span>
        ),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        align: 'right',
        render: (updatedAt: string) => (
          <span title={new Date(updatedAt).toLocaleString()}>
            <Moment fromNow ago date={updatedAt} />
          </span>
        ),
        defaultSortOrder: 'descend',
        sorter: (a: Transcript, b: Transcript) =>
          new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime(),
      },
      {
        title: (
          <span>
            Added <small>(ago)</small>
          </span>
        ),
        dataIndex: 'createdAt',
        key: 'createdAt',
        align: 'right',
        render: (createdAt: string) => (
          <span title={new Date(createdAt).toLocaleString()}>
            <Moment fromNow ago date={createdAt} />
          </span>
        ),
        sorter: (a: Transcript, b: Transcript) =>
          new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
      },
    ],
    [],
  );

  return (
    <Layout>
      <PageHeader title="OpenEditor" extra={userMenu} />
      <Content>
        <Table dataSource={transcripts} columns={columns} rowKey="id" pagination={false} sticky />
        <Drawer
          title={statusDrawerTranscript?.title}
          placement="right"
          onClose={closeStatusDrawer}
          visible={statusDrawerVisible}
          width={600}>
          {statusDrawerTranscript ? (
            <StatusCard transcript={statusDrawerTranscript} user={user} groups={groups} />
          ) : null}
        </Drawer>
        <DataCard objects={{ user, transcripts }} />
        <Footer>
          <small style={{ display: 'block', textAlign: 'center' }}>
            All code open source,{' '}
            <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer">
              GNU AGPL Licensed
            </a>{' '}
            and available on{' '}
            <a href="https://github.com/OpenEditor/openeditor" target="_blank" rel="noopener noreferrer">
              github.com/OpenEditor
            </a>{' '}
            &copy;2019&#8211;{new Date().getFullYear()}{' '}
          </small>
        </Footer>
        <BackTop />
      </Content>
    </Layout>
  );
};

export default Home;

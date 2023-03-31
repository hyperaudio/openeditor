/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-restricted-globals */
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { DataStore } from 'aws-amplify';
import { useAtom } from 'jotai';
import Moment from 'react-moment';
import 'moment-timezone';
import TC, { FRAMERATE } from 'smpte-timecode';
import {
  Layout,
  Col,
  Row,
  Table,
  Typography,
  Drawer,
  Button,
  Space,
  Divider,
  FloatButton,
  Popconfirm,
  Modal,
  Input,
  message,
} from 'antd';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import FolderAddOutlined from '@ant-design/icons/FolderAddOutlined';
import FolderTwoTone from '@ant-design/icons/FolderTwoTone';
import VideoCameraTwoTone from '@ant-design/icons/VideoCameraTwoTone';
import AudioTwoTone from '@ant-design/icons/AudioTwoTone';
import { ColumnsType } from 'antd/es/table';
import { PageContainer } from '@ant-design/pro-components';

import { User, Transcript, Folder } from '../models';
import StatusCard, { StatusTag, StatusBadge } from '../components/StatusCard';
import UserAvatar, { UserAvatarGroup } from '../components/UserAvatar';
import DataCard from '../components/DataCard';
import Footer from '../components/Footer';
import { darkModeAtom } from '../atoms';

const { Header, Content } = Layout;
const { Text } = Typography;

interface HomeProps {
  uuid: string | undefined;
  user: User | undefined;
  users: User[] | undefined;
  groups: string[];
  userMenu: JSX.Element;
  folder: Folder | undefined;
  folders: Folder[] | undefined;
  transcripts: Transcript[] | undefined;
}

const Home = ({
  uuid,
  user,
  users,
  groups,
  folder,
  folders = [],
  transcripts = [],
  userMenu,
}: HomeProps): JSX.Element => {
  const history = useHistory();
  const [darkMode] = useAtom(darkModeAtom);
  const [messageApi, contextHolder] = message.useMessage();

  const rows = useMemo(
    () => [
      // eslint-disable-next-line eqeqeq
      ...folders.filter(({ parent }) => parent == uuid),
      // eslint-disable-next-line eqeqeq
      ...transcripts.filter(({ parent }) => parent == uuid),
    ],
    [folders, transcripts, uuid],
  );

  const newTranscript = useCallback(async () => {
    const transcript = await DataStore.save(
      new Transcript({
        title: `New Transcript ${new Date().toLocaleString()}`,
        parent: folder?.id ?? null,
        language: 'en-US',
        media: '{}',
        metadata: JSON.stringify({
          createdBy: user?.id,
          updatedBy: [user?.id],
        }),
        status: JSON.stringify({
          step: 0,
          steps: [
            {
              type: 'upload',
              status: 'wait',
            },
            {
              type: 'transcode',
            },
            {
              type: 'transcribe',
            },
            {
              type: 'edit',
            },
            {
              type: 'align',
            },
          ],
        }),
      }),
    );

    console.log({ transcript });
    history.push(`/${transcript.id}`);
  }, [history, folder, user]);

  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
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

  const newFolder = useCallback(async () => setNewFolderModalVisible(true), []);
  const createFolder = useCallback(async () => {
    const newFolder = await DataStore.save(
      new Folder({
        title: newFolderName,
        parent: folder?.id ?? null,
        metadata: JSON.stringify({
          createdBy: user?.id,
          updatedBy: [user?.id],
        }),
        status: '{}',
      }),
    );

    console.log({ newFolder });
    setNewFolderModalVisible(false);
  }, [folder, newFolderName, user]);

  const columns = useMemo(
    (): ColumnsType<Transcript | Folder> => [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: '33%',
        render: (title: string, record: Transcript | Folder) => (
          <span>
            {record instanceof Folder ? (
              <FolderTwoTone style={{ fontSize: 20, marginRight: 10 }} />
            ) : (record.status as any)?.steps?.[0]?.data?.ffprobe?.streams.findIndex(
                ({ codec_type: type }: { codec_type: string }) => type === 'video',
              ) > -1 ? (
              <VideoCameraTwoTone style={{ fontSize: 20, marginRight: 10 }} />
            ) : (
              <AudioTwoTone style={{ fontSize: 20, marginRight: 10 }} />
            )}
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
        render: (status: any, record) =>
          record instanceof Transcript ? (
            <div style={{ display: 'inline-block' }} onClick={() => openStatusDrawer(record as Transcript)}>
              <StatusTag transcript={record as Transcript} />
            </div>
          ) : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // render: (status: any, record) => <StatusBadge transcript={record} />,
      },
      {
        title: 'Duration',
        dataIndex: ['status'],
        key: 'duration',
        align: 'right',
        // FIXME: move to component, memoize, add folder timing (recursive sum of children)
        render: status => (
          <span>
            {status?.steps?.[0]?.data?.ffprobe?.streams?.[0]?.duration
              ? timecode({
                  seconds: status?.steps?.[0]?.data?.ffprobe?.streams?.[0]?.duration ?? 0,
                  partialTimecode: true,
                })
              : null}
          </span>
        ),
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
        // sortr2: (a: Transcript | Folder, b: Transcript | Folder) =>
        //   new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime(),
        sorter: (a: Transcript | Folder, b: Transcript | Folder) => {
          if (a instanceof Folder && b instanceof Transcript) {
            return 1; // sort a before b
          }
          if (a instanceof Transcript && b instanceof Folder) {
            return -1; // sort b before a
          }
          return new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime();
        },
      },
      {
        title: 'by',
        dataIndex: ['metadata', 'updatedBy'],
        key: 'updatedBy',
        render: updatedBy => <UserAvatarGroup ids={Array.isArray(updatedBy) ? updatedBy : []} users={users} />,
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
        sorter: (a: Transcript | Folder, b: Transcript | Folder) =>
          new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
      },
      {
        title: 'by',
        dataIndex: ['metadata', 'createdBy'],
        key: 'createdBy',
        render: createdBy => <UserAvatar id={createdBy} users={users} />,
      },
    ],
    [openStatusDrawer, users],
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]): void => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const deleteRows = useCallback(async () => {
    await Promise.all(
      selectedRowKeys.map(async id => {
        const transcript = await DataStore.query(Transcript, id as string);
        console.log('deleting', { transcript });
        messageApi.open({
          type: 'warning',
          content: `Delete disabled for now`,
        });
        // if (transcript) return DataStore.delete(transcript);
        return null;
      }),
    );
    setSelectedRowKeys([]);
  }, [selectedRowKeys, messageApi]);

  const routes = useMemo(() => {
    const home = { path: '/', breadcrumbName: 'Home' };
    if (!folder) return [home];

    const findParents = (f: Folder): Folder[] => {
      const p = folders?.find(({ id }) => id === f.parent);
      if (!p) return [];

      return [p, ...findParents(p as Folder)];
    };
    const parents = findParents(folder);

    return [home, ...parents.reverse().map(({ id, title }) => ({ path: `/${id}`, breadcrumbName: title }))];
  }, [folder, folders]);

  const itemRender = useCallback(
    (route: any, params: any, routes: any[], paths: any[]) => <Link to={route.path}>{route.breadcrumbName}</Link>,
    [],
  );

  return (
    <>
      {contextHolder}
      <Layout>
        <PageContainer
          breadcrumb={{
            routes,
            itemRender,
          }}
          title={
            <>
              <span>{folder ? folder.title : 'OpenEditor'}</span>{' '}
            </>
          }
          extra={
            <Space>
              <Button type="default" shape="round" icon={<FolderAddOutlined />} onClick={newFolder}>
                New Folder
              </Button>
              <Button type="primary" shape="round" icon={<UploadOutlined />} onClick={newTranscript}>
                New Transcript
              </Button>
              <Divider />
              {userMenu}
            </Space>
          }
        />
        <Content>
          <Row
            style={{
              backgroundColor: darkMode ? 'black' : 'white',
              // paddingTop: '3em',
              // paddingBottom: '5em',
            }}>
            <Col span={22} offset={1}>
              <Table
                size="middle"
                rowKey="id"
                pagination={false}
                sticky
                dataSource={rows}
                columns={columns}
                rowSelection={rowSelection}
              />
            </Col>
          </Row>
          <Drawer
            title={statusDrawerTranscript?.title}
            placement="right"
            onClose={closeStatusDrawer}
            open={statusDrawerVisible}
            width={600}>
            {statusDrawerTranscript ? (
              <StatusCard transcript={statusDrawerTranscript} user={user} groups={groups} />
            ) : null}
          </Drawer>
          <Modal
            destroyOnClose
            title="New Folder"
            style={{ top: 20 }}
            open={newFolderModalVisible}
            onOk={() => createFolder()}
            onCancel={() => setNewFolderModalVisible(false)}>
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={({ target: { value } }) => setNewFolderName(value)}
            />
          </Modal>
          <DataCard objects={{ user, folder, folders, transcripts }} />
          {selectedRowKeys.length > 0 ? (
            <FloatButton.Group shape="square" style={{ right: 94 }}>
              <FloatButton icon={<FolderOpenOutlined />} tooltip="Move to folder" type="primary" />
              <Popconfirm
                title="Delete selected items"
                description={`Delete ${selectedRowKeys.length} items?`}
                placement="left"
                icon={<DeleteOutlined style={{ color: 'red' }} />}
                onConfirm={deleteRows}
                // onCancel={cancel}
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel">
                <FloatButton
                  icon={<DeleteOutlined />}
                  // tooltip="Delete"
                  type="primary"
                  className="danger-button"
                  // onClick={deleteRows}
                />
              </Popconfirm>
            </FloatButton.Group>
          ) : null}
          <Footer />
          <FloatButton.BackTop />
        </Content>
      </Layout>
    </>
  );
};

// FIXME: DRY, move to utils
const timecode = ({ seconds = 0, frameRate = 1000, dropFrame = false, partialTimecode = false }): string => {
  const tc = TC(seconds * frameRate, frameRate as FRAMERATE, dropFrame).toString();
  // hh:mm:ss
  if (partialTimecode) return tc.split(':').slice(0, 3).join(':');

  // hh:mm:ss.mmmm
  if (frameRate === 1000) {
    const [hh, mm, ss, mmm] = tc.split(':');
    if (mmm.length === 1) return `${hh}:${mm}:${ss}.${mmm}00`;
    if (mmm.length === 2) return `${hh}:${mm}:${ss}.${mmm}0`;
    return `${hh}:${mm}:${ss}.${mmm}`;
  }

  return tc;
};

export default Home;

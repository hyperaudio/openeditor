/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-restricted-globals */
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { DataStore, Storage, API } from 'aws-amplify';
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
  Tree,
} from 'antd';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import FolderAddOutlined from '@ant-design/icons/FolderAddOutlined';
import FolderTwoTone from '@ant-design/icons/FolderTwoTone';
import ProjectOutlined from '@ant-design/icons/ProjectOutlined';
import ProjectTwoTone from '@ant-design/icons/ProjectTwoTone';
import VideoCameraTwoTone from '@ant-design/icons/VideoCameraTwoTone';
import AudioTwoTone from '@ant-design/icons/AudioTwoTone';
import { ColumnsType } from 'antd/es/table';
import { PageContainer } from '@ant-design/pro-components';
import axios from 'axios';
import lunr from 'lunr';
import Highlighter from 'react-highlight-words';

import { User, Transcript, Project, Folder } from '../models';
import StatusCard, { StatusTag, StatusBadge } from '../components/cards/StatusCard';
import UserAvatar, { UserAvatarGroup } from '../components/UserAvatar';
import DataCard from '../components/cards/DataCard';
import Footer from '../components/Footer';
import { darkModeAtom } from '../atoms';
import indexData from '../data/index.json';

import type { DataNode, DirectoryTreeProps } from 'antd/es/tree';

const { Header, Content } = Layout;
const { Text } = Typography;
const { DirectoryTree } = Tree;
const { Search } = Input;

interface HomeProps {
  uuid: string | undefined;
  user: User | undefined;
  users: User[] | undefined;
  groups: string[];
  userMenu: JSX.Element;
  project: Project | undefined;
  projects: Project[] | undefined;
  folder: Folder | undefined;
  folders: Folder[] | undefined;
  transcripts: Transcript[] | undefined;
  root: Project | Folder | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routes: any[];
}

const Home = ({
  uuid,
  user,
  users,
  groups,
  project,
  projects = [],
  folder,
  folders = [],
  transcripts = [],
  userMenu,
  root,
  routes = [],
}: HomeProps): JSX.Element => {
  const history = useHistory();
  const [darkMode] = useAtom(darkModeAtom);
  const [messageApi, contextHolder] = message.useMessage();

  const rows = useMemo(
    () =>
      [
        // eslint-disable-next-line eqeqeq
        ...projects.filter(({ parent }) => parent == uuid),
        // eslint-disable-next-line eqeqeq
        ...folders.filter(({ parent }) => parent == uuid),
        // eslint-disable-next-line eqeqeq
        ...transcripts.filter(({ parent }) => parent == uuid),
      ].filter(row => {
        const metadata = JSON.parse(JSON.stringify(row.metadata)); // FIXME
        return metadata?.deleted !== true;
      }),
    [projects, folders, transcripts, uuid],
  );

  const newTranscript = useCallback(async () => {
    const transcript = await DataStore.save(
      new Transcript({
        title: `New Transcript ${new Date().toLocaleString()}`,
        parent: folder?.id ?? project?.id ?? null,
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
  }, [history, project, folder, user]);

  // const createTranscripts = useCallback(async () => {
  //   const t = [];
  //   const data = [];

  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const d of data) {
  //     // console.log(d);
  //     // eslint-disable-next-line no-await-in-loop
  //     const t1 = await DataStore.save(
  //       new Transcript({
  //         title: d.title,
  //         parent: d.parent,
  //         language: 'en-US',
  //         media: '{}',
  //         metadata: JSON.stringify({
  //           PK: d.metadata.PK,
  //           src: d.metadata.src,
  //           createdBy: user?.id,
  //           updatedBy: [user?.id],
  //         }),
  //         status: JSON.stringify({
  //           step: 0,
  //           steps: [
  //             {
  //               type: 'upload',
  //               status: 'wait',
  //             },
  //             {
  //               type: 'transcode',
  //             },
  //             {
  //               type: 'transcribe',
  //             },
  //             {
  //               type: 'edit',
  //             },
  //             {
  //               type: 'align',
  //             },
  //           ],
  //         }),
  //       }),
  //     );
  //     t.push({ id: t1.id, PK: d.metadata.PK });
  //   }
  //   console.log({ t });
  // }, [user]);

  // const updateTranscript = useCallback(async () => {
  //   const t = [];

  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const ID of t) {
  //     const { id } = ID;

  //     // eslint-disable-next-line no-await-in-loop
  //     const original = await DataStore.query(Transcript, id);
  //     // eslint-disable-next-line no-await-in-loop
  //     await DataStore.save(
  //       // eslint-disable-next-line no-loop-func
  //       Transcript.copyOf(original as Transcript, (updated: any) => {
  //         const originalStatus = JSON.parse(JSON.stringify(original?.status)); // FIXME
  //         originalStatus.step = 3;
  //         originalStatus.steps[2].status = 'finish';
  //         // eslint-disable-next-line no-param-reassign
  //         updated.status = JSON.stringify({
  //           ...originalStatus,
  //         });
  //       }),
  //     );
  //   }
  // }, []);

  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [moveToFolderModalVisible, setMoveToFolderModalVisible] = useState(false);
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

  const newFolder = useCallback(() => setNewFolderModalVisible(true), []);
  const newProject = useCallback(() => setNewProjectModalVisible(true), []);

  const columns = useMemo(
    (): ColumnsType<Transcript | Folder> => [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: '33%',
        render: (title: string, record: Transcript | Folder) => {
          const metadata = JSON.parse(JSON.stringify(record.metadata)); // FIXME
          return (
            <span>
              {record instanceof Project ? (
                <ProjectTwoTone style={{ fontSize: 20, marginRight: 10 }} />
              ) : record instanceof Folder ? (
                <FolderTwoTone style={{ fontSize: 20, marginRight: 10 }} />
              ) : (record.status as any)?.steps?.[0]?.data?.ffprobe?.streams.findIndex(
                  ({ codec_type: type }: { codec_type: string }) => type === 'video',
                ) > -1 ? (
                <VideoCameraTwoTone style={{ fontSize: 20, marginRight: 10 }} />
              ) : (
                <AudioTwoTone style={{ fontSize: 20, marginRight: 10 }} />
              )}
              <Link to={`/${record.id}`}>
                <Text
                  style={{
                    textDecoration: metadata.deleted ? 'line-through' : 'none',
                  }}>
                  {title}
                </Text>
              </Link>
            </span>
          );
        },
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
        const project = (await DataStore.query(Project, id as string)) as Project;
        const folder = (await DataStore.query(Folder, id as string)) as Folder;
        const transcript = (await DataStore.query(Transcript, id as string)) as Transcript;

        const item = project || folder || transcript;

        // Actual delete
        // if (transcript) return DataStore.delete(transcript);

        // Mark as deleted
        const metadata = JSON.parse(JSON.stringify(item.metadata)); // FIXME

        if (project)
          await DataStore.save(
            Project.copyOf(project, (updated: any) => {
              // eslint-disable-next-line no-param-reassign
              updated.metadata = JSON.stringify({ ...metadata, deleted: true });
            }),
          );

        if (folder)
          await DataStore.save(
            Folder.copyOf(folder, (updated: any) => {
              // eslint-disable-next-line no-param-reassign
              updated.metadata = JSON.stringify({ ...metadata, deleted: true });
            }),
          );

        if (transcript)
          await DataStore.save(
            Transcript.copyOf(transcript, (updated: any) => {
              // eslint-disable-next-line no-param-reassign
              updated.metadata = JSON.stringify({ ...metadata, deleted: true });
            }),
          );

        messageApi.open({
          type: 'warning',
          content: `${item.title} deleted`,
        });
        return null;
      }),
    );
    setSelectedRowKeys([]);
  }, [selectedRowKeys, messageApi]);

  const itemRender = useCallback(
    (route: any, params: any, routes: any[], paths: any[]) => <Link to={route.path}>{route.breadcrumbName}</Link>,
    [],
  );

  const [searchResults, setSearchResults] = useState<any | null>(null);

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
              <span>{project ? project.title : folder ? folder.title : 'OpenEditor'}</span> <br />
            </>
          }
          extra={
            <Space>
              <SearchBox root={root} setSearchResults={setSearchResults} />
              {groups.includes('Admins') && !uuid ? (
                <Button type="default" shape="round" icon={<ProjectOutlined />} onClick={newProject}>
                  New Project
                </Button>
              ) : null}
              {uuid ? (
                <>
                  <Button type="default" shape="round" icon={<FolderAddOutlined />} onClick={newFolder}>
                    New Folder
                  </Button>
                  <Button type="primary" shape="round" icon={<UploadOutlined />} onClick={newTranscript}>
                    New Transcript
                  </Button>
                </>
              ) : null}
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
              {searchResults ? (
                <div>
                  {(searchResults as any).results.map((result: any) => (
                    <div style={{ marginTop: '2em' }}>
                      <Link to={`/${result.ref}`}>{transcripts?.find(t => result.ref.startsWith(t.id))?.title}</Link>
                      <br />
                      <Excerpt
                        id={result.ref.substring(0, result.ref.indexOf('#'))}
                        block={result.ref.substring(result.ref.indexOf('#') + 1, result.ref.indexOf('?'))}
                        query={(searchResults as any).query}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <Table
                size="middle"
                rowKey="id"
                pagination={false}
                sticky
                dataSource={rows}
                columns={columns}
                rowSelection={rowSelection}
                // rowSelection={uuid ? rowSelection : undefined}
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
          <NewProjectModal visible={newProjectModalVisible} setVisible={setNewProjectModalVisible} userId={user?.id} />
          <NewFolderModal
            visible={newFolderModalVisible}
            setVisible={setNewFolderModalVisible}
            userId={user?.id}
            parentId={project?.id ?? folder?.id}
          />
          {selectedRowKeys.length > 0 ? (
            <MoveToFolderModal
              visible={moveToFolderModalVisible}
              setVisible={setMoveToFolderModalVisible}
              userId={user?.id}
              root={root}
              folder={folder}
              folders={folders}
              selectedRowKeys={selectedRowKeys}
            />
          ) : null}
          {/* <Button onClick={updateTranscript} type="primary">
            IMPORT
          </Button> */}
          <DataCard objects={{ user, groups, project, projects, folder, folders, transcripts }} />
          {selectedRowKeys.length > 0 ? (
            <FloatButton.Group shape="square" style={{ right: 94 }}>
              {root ? (
                <FloatButton
                  icon={<FolderOpenOutlined />}
                  tooltip="Move to folder"
                  type="primary"
                  onClick={() => setMoveToFolderModalVisible(true)}
                />
              ) : null}
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
                <FloatButton icon={<DeleteOutlined />} type="primary" className="danger-button" />
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

const Excerpt = ({ id, block, query }: { id: string; block: string; query: string }): JSX.Element => {
  const [text, setText] = useState('');

  useEffect(() => {
    API.get('search', '/search', { queryStringParameters: { id, block, query } })
      .then(response => {
        // Add your code here
        // console.log(response);
        setText(response.text);
      })
      .catch(error => {
        console.log(error.response);
      });
  }, [id, block, query]);
  return (
    <p>
      <Highlighter highlightClassName="matchedText" searchWords={query.split(' ')} autoEscape textToHighlight={text} />
    </p>
  );
};

const SearchBox = ({
  root,
  setSearchResults,
}: {
  root: Project | Folder | undefined;
  setSearchResults: (results: any | null) => void;
}): JSX.Element => {
  const [index, setIndex] = useState<lunr.Index | undefined>(undefined);
  const [searchString, setSearchString] = useState('');

  useEffect(() => {
    (async () => {
      // const { data } = await axios.get(await Storage.get(`indexes/index.json`, { level: 'public' }));
      setIndex(lunr.Index.load(indexData));
    })();
  }, [root]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
    // TBD filter title search? (+debounce)
  }, []);

  const handleSearch = useCallback(() => {
    if (!index) return;
    if (searchString.trim().length === 0) {
      setSearchResults(null);
      return;
    }
    const results = (index as any).search(searchString);
    // console.log(results);

    // API.get('search', '/search', { queryStringParameters: { query: searchString, index: 'default' } })
    //   .then(response => {
    //     console.log(response);
    //   })
    //   .catch(error => {
    //     console.log(error.response);
    //   });

    setSearchResults({ query: searchString, results });
  }, [index, searchString, setSearchResults]);

  return (
    <Search
      allowClear
      disabled={!index}
      placeholder="input search text"
      value={searchString}
      onChange={handleSearchChange}
      onSearch={handleSearch}
    />
  );
};

const NewFolderModal = ({
  visible,
  setVisible,
  parentId,
  userId,
}: {
  visible: boolean;
  setVisible: (visibility: boolean) => void;
  parentId: string | undefined;
  userId: string | undefined;
}): JSX.Element => {
  const [newFolderName, setNewFolderName] = useState('');

  const createFolder = useCallback(async () => {
    const newFolder = await DataStore.save(
      new Folder({
        title: newFolderName,
        parent: parentId,
        metadata: JSON.stringify({
          createdBy: userId,
          updatedBy: [userId],
        }),
        status: '{}',
      }),
    );

    console.log({ newFolder });
    setVisible(false);
  }, [parentId, newFolderName, userId, setVisible]);

  const handleOk = useCallback(() => createFolder(), [createFolder]);
  const handleCancel = useCallback(() => setVisible(false), [setVisible]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;
    setNewFolderName(value);
  }, []);

  return (
    <Modal destroyOnClose title="New Folder" style={{ top: 20 }} open={visible} onOk={handleOk} onCancel={handleCancel}>
      <Input placeholder="Folder name" value={newFolderName} onChange={handleChange} />
    </Modal>
  );
};

const NewProjectModal = ({
  visible,
  setVisible,
  userId,
}: {
  visible: boolean;
  setVisible: (visibility: boolean) => void;
  userId: string | undefined;
}): JSX.Element => {
  const [value, setValue] = useState('');

  const createProject = useCallback(async () => {
    const newProject = await DataStore.save(
      new Project({
        title: value,
        users: [userId ?? ''], // FIXME: handle undefined
        metadata: JSON.stringify({
          createdBy: userId,
          updatedBy: [userId],
        }),
        status: '{}',
      }),
    );

    console.log({ newProject });
    setVisible(false);
  }, [value, userId, setVisible]);

  const handleOk = useCallback(() => createProject(), [createProject]);
  const handleCancel = useCallback(() => setVisible(false), [setVisible]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;
    setValue(value);
  }, []);

  return (
    <Modal
      destroyOnClose
      title="New Project"
      style={{ top: 20 }}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}>
      <Input placeholder="Project name" value={value} onChange={handleChange} />
    </Modal>
  );
};

const MoveToFolderModal = ({
  visible,
  setVisible,
  userId,
  root,
  folder,
  folders,
  selectedRowKeys = [],
}: {
  visible: boolean;
  setVisible: (visibility: boolean) => void;
  userId: string | undefined;
  root: Project | Folder | undefined;
  folder: Folder | undefined;
  folders: Folder[];
  selectedRowKeys: React.Key[];
}): JSX.Element => {
  const moveToFolder = useCallback(() => {
    console.log('move to folder');
  }, []);

  console.log({ root, folder });

  const treeData: DataNode[] = useMemo(() => {
    if (!root) return [];

    const rootNode = {
      title: root.title,
      key: root.id,
      children: [],
    };

    const findChildren = (node: DataNode): DataNode | void => {
      const children = folders.filter(f => f.parent === node.key);
      if (children.length > 0) {
        // eslint-disable-next-line no-param-reassign
        node.children = children.map(c => ({
          title: c.title,
          key: c.id,
          children: [],
        }));
        node.children.forEach(findChildren);
      }
    };

    return [findChildren(rootNode) ?? rootNode];
  }, [root, folders]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const moveToParent = useCallback(async () => {
    const [parentId] = selectedKeys;
    if (!parentId || parentId === '') return;

    await Promise.all(
      selectedRowKeys.map(async id => {
        const folder = (await DataStore.query(Folder, id as string)) as Folder;
        const transcript = (await DataStore.query(Transcript, id as string)) as Transcript;

        if (folder)
          await DataStore.save(
            Folder.copyOf(folder, (updated: any) => {
              // eslint-disable-next-line no-param-reassign
              updated.parent = parentId;
            }),
          );

        if (transcript)
          await DataStore.save(
            Transcript.copyOf(transcript, (updated: any) => {
              // eslint-disable-next-line no-param-reassign
              updated.parent = parentId;
            }),
          );

        return null;
      }),
    );
    // setSelectedRowKeys([]);
    setVisible(false);
  }, [selectedRowKeys, selectedKeys, setVisible]);

  const handleSelect = useCallback((keys: React.Key[], e: any) => {
    setSelectedKeys(keys as string[]);
  }, []);

  const handleOk = useCallback(() => moveToParent(), [moveToParent]);
  const handleCancel = useCallback(() => setVisible(false), [setVisible]);

  return (
    <Modal
      destroyOnClose
      title="Move to Folder"
      style={{ top: 20 }}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}>
      <DirectoryTree
        defaultExpandAll
        onSelect={handleSelect}
        treeData={treeData}
        defaultSelectedKeys={folder ? [folder.id] : []}
      />
    </Modal>
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

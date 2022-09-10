import React, { useCallback, useMemo } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { DataStore } from 'aws-amplify';
import ReactJson from 'react-json-view';
import { Layout, PageHeader, Card, Button } from 'antd';

import { User, Transcript } from '../models';

const { Header, Content } = Layout;

interface HomeProps {
  user: User | undefined;
  groups: string[];
  userMenu: JSX.Element;
  transcripts: Transcript[] | undefined;
  darkMode: boolean;
  debug: boolean;
}

const Home = ({ user, groups, transcripts, userMenu, debug, darkMode }: HomeProps): JSX.Element => {
  const history = useHistory();

  const newTranscript = useCallback(async () => {
    const transcript = await DataStore.save(
      new Transcript({
        title: 'test',
        language: 'en-US',
        media: '{}',
        metadata: '{}',
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
  }, [history]);

  const sortedTranscripts = useMemo(
    () => transcripts?.sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()),
    [transcripts],
  );

  return (
    <Layout>
      <PageHeader title="OpenEditor" extra={userMenu} />
      <Content>
        {debug && (
          <Card title="Data" size="small" style={{ maxWidth: '50vw', margin: '2em auto' }}>
            <Button onClick={newTranscript}>New Transcript</Button>
            <ReactJson
              name="user"
              iconStyle="circle"
              collapsed
              quotesOnKeys={false}
              displayDataTypes={false}
              displayObjectSize={false}
              src={user ?? {}}
              theme={darkMode ? 'summerfruit' : 'summerfruit:inverted'}
            />
            <ReactJson
              name="transcripts"
              iconStyle="circle"
              collapsed
              quotesOnKeys={false}
              displayDataTypes={false}
              displayObjectSize={false}
              src={sortedTranscripts ?? []}
              theme={darkMode ? 'summerfruit' : 'summerfruit:inverted'}
            />
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default Home;

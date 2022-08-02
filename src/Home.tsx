import React, { useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { DataStore } from 'aws-amplify';
import { Layout, PageHeader, Button } from 'antd';

import { User, Transcript } from './models';

const { Header, Content } = Layout;

interface HomeProps {
  user: User | undefined;
  groups: string[];
  userMenu: JSX.Element;
}

const Home = ({ user, groups, userMenu }: HomeProps): JSX.Element => {
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

  return (
    <Layout>
      <PageHeader title="OpenEditor" extra={userMenu} />
      <Content>
        <Button onClick={newTranscript}>New Transcript</Button>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </Content>
    </Layout>
  );
};

export default Home;

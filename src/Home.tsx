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
              progress: 0,
              status: 'wait',
              title: {
                default: 'Upload',
                wait: 'Ready to upload',
                process: 'Uploading',
                finish: 'Uploaded',
                error: 'Upload failed',
              },
              description: {
                default: 'Upload a media file',
              },
            },
            {
              type: 'transcode',
              progress: 0,
              // status: 'wait',
              title: {
                default: 'Transcode',
                wait: 'Ready to transcode',
                process: 'Transcoding',
                finish: 'Transcoded',
                error: 'Transcode failed',
              },
              description: {
                default: 'Transcode to a speech-recognition format',
              },
            },
            {
              type: 'transcribe',
              progress: 0,
              // status: 'wait',
              title: {
                default: 'Transcribe',
                wait: 'Ready to transcribe',
                process: 'Transcribing',
                finish: 'Transcribed',
                error: 'Transcribe failed',
              },
              description: {
                default: 'Transcribe the speech-recognition format',
              },
            },
            {
              type: 'edit',
              progress: 0,
              // status: 'wait',
              title: {
                default: 'Edit',
                wait: 'Ready to edit',
                process: 'Editing',
                finish: 'Edited',
                error: 'Edit failed',
              },
              description: {
                default: 'Edit the transcript',
              },
            },
            {
              type: 'align',
              progress: 0,
              // status: 'wait',
              title: {
                default: 'Realign',
                wait: 'Ready to realign',
                process: 'Realigning',
                finish: 'Realigned',
                error: 'Realign failed',
              },
              description: {
                default: 'Realign the transcript',
              },
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

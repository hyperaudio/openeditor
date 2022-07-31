import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Storage } from 'aws-amplify';
import { v4 as uuidv4 } from 'uuid';
import { Layout, Col, Row, PageHeader, Card, Steps, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';

import { User, Transcript } from './models';

import type { UploadRequestOption } from 'rc-upload/lib/interface';

const { Content } = Layout;
const { Step } = Steps;

interface TranscriptPageProps {
  user: User | undefined;
  groups: string[];
  transcripts: Transcript[] | undefined;
  userMenu: JSX.Element;
}

const TranscriptPage = ({ user, groups, transcripts, userMenu }: TranscriptPageProps): JSX.Element => {
  const params = useParams();
  const { uuid } = params as Record<string, string>;

  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<'wait' | 'process' | 'finish' | 'error' | undefined>('wait');
  const [progress, setProgress] = useState(0);

  // const transcript = useMemo(
  //   () => transcripts?.find(({ id }) => id === `${params.a}-${params.b}-${params.c}-${params.d}-${params.e}`),
  //   [params, transcripts],
  // );

  // console.log({ params, user, transcripts });

  const handleUpload = useCallback(({ file, onError, onSuccess }: UploadRequestOption) => {
    setStatus('process');
    console.log('handleUpload', file);

    const { name, type, size } = file as RcFile;

    const key = `uploads/${new Date().toISOString().split(/[-|T]/).join('/')}/${uuidv4()}.${name.split('.').pop()}`;

    Storage.put(key, file, {
      progressCallback: ({ loaded, total }) => setProgress((100 * loaded) / total),
    })
      .then(async ({ key }) => {
        // this.setState({ uploadAlert: null });
        console.log({ key });
        setStatus('finish');
        setStep(1);
        setProgress(0);
        setStatus('wait');
      })
      .catch(err => {
        console.log(err);
        // this.setState({ uploadAlert: err });
        setStatus('error');
      });
  }, []);

  return (
    <Layout>
      <PageHeader
        className="site-page-header"
        title={uuid}
        // subTitle="This is a subtitle"
        extra={userMenu}
      />
      <Content style={{ minHeight: '100vh' }}>
        <Row>
          <Col span={12} offset={6}>
            <Card title="Operations in progress">
              <Steps current={step} direction="vertical" percent={progress} status={status}>
                <Step
                  title="Upload"
                  description={
                    <Upload showUploadList={false} maxCount={1} customRequest={handleUpload}>
                      <Button
                        icon={<UploadOutlined />}
                        disabled={step !== 0 || status === 'process' || status === 'finish'}>
                        Upload
                      </Button>
                    </Upload>
                  }
                />
                <Step title="Transcode" description="This is a description." />
                <Step title="Transcribe" description="This is a description." />
              </Steps>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default TranscriptPage;

// wait process finish error

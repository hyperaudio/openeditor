import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { DataStore, Storage } from 'aws-amplify';
import { v4 as uuidv4 } from 'uuid';
import { Layout, Col, Row, PageHeader, Card, Steps, Button, Upload, Select, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';

import { User, Transcript } from './models';
import languages from './data/aws-transcribe-languages.json';

import type { UploadRequestOption, UploadProgressEvent, UploadRequestError } from 'rc-upload/lib/interface';
import type { UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';

const { Content } = Layout;
const { Step } = Steps;
const { Option } = Select;

interface TranscriptPageProps {
  user: User | undefined;
  groups: string[];
  transcripts: Transcript[] | undefined;
  userMenu: JSX.Element;
}

const TranscriptPage = ({ user, groups, transcripts, userMenu }: TranscriptPageProps): JSX.Element => {
  const params = useParams();
  const { uuid } = params as Record<string, string>;

  const [transcript, setTranscript] = useState<Transcript | undefined>(undefined);
  useEffect(() => setTranscript(transcripts?.find(({ id }) => id === uuid)), [transcripts, uuid]);

  const [steps, setSteps] = useState([]);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<'wait' | 'process' | 'finish' | 'error' | undefined>('wait');
  const [progress, setProgress] = useState(0);

  const [fileList, setFileList] = useState<UploadFile[]>([
    {
      uid: '-1',
      name: 'xxx.png',
      status: 'done',
      url: 'http://www.baidu.com/xxx.png',
    },
  ]);

  useEffect(() => {
    if (!transcript) return;

    const { step, steps } = (transcript.status as unknown as Record<string, any>) ?? { step: 0, steps: [] };

    setSteps(steps);
    setStep(step);
    setStatus(steps[step].status);
    setProgress(steps[step].progress);
  }, [transcript]);

  const updateStatus = useCallback(
    async ({
      step,
      status,
      progress,
    }: {
      step: number;
      status: 'wait' | 'process' | 'finish' | 'error' | undefined;
      progress: number;
    }) => {
      const original = await DataStore.query(Transcript, uuid);
      if (!original) return;
      await DataStore.save(
        Transcript.copyOf(original, updated => {
          const originalStatus = JSON.parse(JSON.stringify(original.status));
          // eslint-disable-next-line no-param-reassign
          updated.status = JSON.stringify({
            ...originalStatus,
            steps: [
              ...originalStatus.steps.slice(0, step),
              {
                ...originalStatus.steps[step],
                status,
                progress,
              },
              ...originalStatus.steps.slice(step + 1),
            ],
          });
        }),
      );
    },
    [uuid],
  );

  const handleUpload = useCallback(
    async ({ file, onError, onSuccess, onProgress, filename, data }: UploadRequestOption) => {
      console.log({ file, filename, data });
      setStatus('process');
      updateStatus({ step: 0, status: 'process', progress: 0 });

      const { name, type, size } = file as RcFile;

      const key = `uploads/${new Date().toISOString().split(/[-|T]/).join('/')}/${uuidv4()}.${name.split('.').pop()}`;

      try {
        await Storage.put(key, file, {
          progressCallback: ({ loaded, total }) => {
            const percent = Math.floor((loaded / total) * 100);
            setProgress(percent);
            if (onProgress) onProgress({ percent } as UploadProgressEvent);
          },
        });
        console.log({ key });
      } catch (error) {
        console.log(error);
        setStatus('error');
        updateStatus({ step: 0, status: 'error', progress: 0 });
        if (onError) onError(error as UploadRequestError); // TBD
      }
      setStatus('finish');
      setProgress(0);
      updateStatus({ step: 0, status: 'finish', progress: 100 });
      if (onSuccess) onSuccess(null); // TBD
    },
    [setProgress, setStatus, updateStatus],
  );

  const handleRemove = useCallback((file: UploadFile) => {
    console.log(file);
    // TODO: set status to wait, update transcript again
  }, []);

  const handleUploadChange = useCallback((change: UploadChangeParam) => {
    console.log(change);
    // TODO: set status to wait, update transcript again?
  }, []);

  const [language, setLanguage] = useState<string>('en-US');
  const languageOptions = useMemo(
    () =>
      languages.map(language => ({
        label: `${language.Language} [${language['Language Code']}]`,
        value: language['Language Code'],
      })),
    [],
  );

  return (
    <Layout>
      <PageHeader className="site-page-header" title={transcript?.title ?? uuid} subTitle={uuid} extra={userMenu} />
      {transcript ? (
        <Content style={{ minHeight: '100vh' }}>
          <Select defaultValue={language} style={{ width: 230 }} onChange={setLanguage}>
            {languageOptions.map(({ label, value }) => (
              <Option key={value} value={value}>
                {label}
              </Option>
            ))}
          </Select>
          <Row>
            <Col span={12} offset={6}>
              <Card title="Operations in progress">
                <Steps current={step} direction="vertical" percent={progress} status={status}>
                  {steps.map(({ type, status, title, description }, index) =>
                    type === 'upload' ? (
                      <Step
                        key={type}
                        title={title[status ?? 'default']}
                        description={
                          <Upload
                            fileList={fileList} // TODO: update file list from status/data, and onChange, fix download
                            showUploadList={{ showRemoveIcon: true, showDownloadIcon: true }}
                            maxCount={1}
                            customRequest={handleUpload}
                            onRemove={handleRemove}
                            onChange={handleUploadChange}
                            onDownload={console.log}>
                            <Button
                              icon={<UploadOutlined />}
                              disabled={step !== index || status === 'process' || status === 'finish'}>
                              Upload
                            </Button>
                          </Upload>
                        }
                      />
                    ) : (
                      <Step
                        key={type}
                        title={title[status ?? 'default']}
                        description={description?.[status ?? 'default'] ?? description?.[null ?? 'default']}
                      />
                    ),
                  )}
                </Steps>
              </Card>
            </Col>
          </Row>
        </Content>
      ) : (
        'Loading…'
      )}
    </Layout>
  );
};

export default TranscriptPage;

// wait process finish error

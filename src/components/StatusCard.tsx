/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useMemo, useCallback, useRef, Ref } from 'react';
import { DataStore, Storage } from 'aws-amplify';
import { v4 as uuidv4 } from 'uuid';
import { Card, Steps, Button, Upload, Select, message } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import mime from 'mime/lite';

import { User, Transcript } from '../models';
import languages from '../data/aws-transcribe-languages.json';

import type { UploadRequestOption, UploadProgressEvent, UploadRequestError } from 'rc-upload/lib/interface';
import type { UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';

const { Step } = Steps;
const { Option } = Select;

interface StatusCardProps {
  user: User | undefined;
  groups: string[];
  transcript: Transcript;
}

const LABELS = {
  upload: {
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
  transcode: {
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
  transcribe: {
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
  edit: {
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
  align: {
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
};

const languageOptions = languages.map(language => ({
  label: `${language.Language} (${language['Language Code']})`,
  value: language['Language Code'],
}));

const StatusCard = ({ user, groups, transcript }: StatusCardProps): JSX.Element => {
  const [step, setStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [status, setStatus] = useState<'wait' | 'process' | 'finish' | 'error' | undefined>('wait');
  const [progress, setProgress] = useState(0);
  const fileList = useRef<UploadFile[]>([]);

  const uuid = transcript.id;

  useEffect(() => {
    if (!transcript) return;
    console.log({ transcript });

    const { step, steps } = (transcript.status as unknown as Record<string, any>) ?? { step: 0, steps: [] };

    setSteps(steps);
    setStep(step);
    setStatus(steps[step].status);
    setProgress(steps[step]?.progress ?? 0);

    const uploadIndex = steps.findIndex((step: any) => step.type === 'upload');
    if (steps[uploadIndex]?.data?.fileList?.length > 0) fileList.current = steps[uploadIndex]?.data?.fileList ?? [];
  }, [transcript]);

  const updateStatus = useCallback(
    async ({
      step,
      status,
      progress,
      data = {},
    }: {
      step: number;
      status: 'wait' | 'process' | 'finish' | 'error' | undefined;
      progress?: number | undefined;
      data?: Record<string, unknown> | undefined;
    }) => {
      const original = await DataStore.query(Transcript, uuid);
      if (!original) return;

      await DataStore.save(
        Transcript.copyOf(original, (updated: any) => {
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
                data: {
                  ...originalStatus.steps[step]?.data,
                  ...data,
                  fileList: fileList.current,
                },
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
      setStatus('process');
      updateStatus({ step: 0, status: 'process', progress: 0 });

      const { name, type, size } = file as RcFile;
      // FIXME: limit on type and size?

      const key = `uploads/${new Date()
        .toISOString()
        .replace(/T(.*)$/, '')
        .replaceAll('-', '/')}/${uuid}/${uuidv4()}.${name.split('.').pop()}`;

      try {
        await Storage.put(key, file, {
          contentType: mime.getType(name) ?? type,
          metadata: {
            transcript: uuid,
            user: user?.id ?? '',
          },
          progressCallback: ({ loaded, total }) => {
            const percent = Math.floor((loaded / total) * 100);
            setProgress(percent);
            if (onProgress) onProgress({ percent } as UploadProgressEvent);
          },
        });
      } catch (error) {
        console.error(error);
        message.error('Upload failed');

        setStatus('error');
        updateStatus({ step: 0, status: 'error', progress: 0 });

        if (onError) onError(error as UploadRequestError);
      }

      setStatus('finish');
      setProgress(0);
      updateStatus({ step: 0, status: 'finish', progress: 100, data: { key } });

      if (onSuccess) onSuccess(null);
    },
    [user, uuid, setProgress, setStatus, updateStatus],
  );

  const handleRemove = useCallback((file: UploadFile) => {
    console.log('remove', file);
  }, []);

  const handleDownload = useCallback(async () => {
    const {
      key,
      fileList: [{ name, type = 'video/mp4' }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = (transcript?.status as unknown as Record<string, any>)?.steps[0]?.data ?? {};

    const hideMessage = message.loading('Download in progress…', 0);
    try {
      const result = await Storage.get(key, { download: true });
      const url = URL.createObjectURL(result.Body as Blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = name ?? `download.${mime.getExtension(type)}`;

      const clickHandler = (): void => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          a.removeEventListener('click', clickHandler);
        }, 150);
      };

      a.addEventListener('click', clickHandler, false);
      a.click();
    } catch (error) {
      message.error('Download failed');
    }
    hideMessage();
  }, [transcript]);

  const handleUploadChange = useCallback((change: UploadChangeParam) => {
    // console.log(change);
    fileList.current = change.fileList;
  }, []);

  const setLanguage = useCallback(
    async (language: string) => {
      const original = await DataStore.query(Transcript, uuid);
      if (!original) return;

      await DataStore.save(
        Transcript.copyOf(original, updated => {
          // eslint-disable-next-line no-param-reassign
          updated.language = language;
        }),
      );
    },
    [uuid],
  );

  const audioKey = useMemo(() => {
    const transcodeIndex = steps.findIndex((step: any) => step.type === 'transcode');
    return (steps[transcodeIndex] as any)?.data?.audio?.key;
  }, [steps]);

  return (
    <Card title="Status">
      <Steps current={step} direction="vertical" percent={progress} status={status}>
        {steps.map(({ type, status, title = {}, description }, index) =>
          type === 'upload' ? (
            <Step
              key={type}
              title={getTitle({ type, status, title })}
              description={
                <Upload
                  fileList={fileList.current}
                  showUploadList={{ showRemoveIcon: false, showDownloadIcon: true }}
                  maxCount={1}
                  customRequest={handleUpload}
                  onRemove={handleRemove}
                  onChange={handleUploadChange}
                  onDownload={handleDownload}>
                  {fileList.current.length === 0 && (
                    <Button
                      icon={<UploadOutlined />}
                      disabled={step !== index || status === 'process' || status === 'finish'}>
                      Upload
                    </Button>
                  )}
                </Upload>
              }
            />
          ) : type === 'transcode' ? (
            <Step
              key={type}
              icon={
                (steps[index] as any).status === 'process' ? <LoadingOutlined style={{ color: '#1890ff' }} /> : null
              }
              title={getTitle({ type, status, title })}
              description={audioKey ? <Audio key={audioKey} /> : getDescription({ type, status, description })}
            />
          ) : type === 'transcribe' ? (
            <Step
              key={type}
              icon={
                (steps[index] as any).status === 'process' ? <LoadingOutlined style={{ color: '#1890ff' }} /> : null
              }
              title={getTitle({ type, status, title })}
              description={
                <Select
                  defaultValue={transcript.language}
                  style={{ width: 230 }}
                  onChange={setLanguage}
                  disabled={step >= index}>
                  {languageOptions.map(({ label, value }) => (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  ))}
                </Select>
              }
            />
          ) : (
            <Step
              key={type}
              title={getTitle({ type, status, title })}
              description={getDescription({ type, status, description })}
            />
          ),
        )}
      </Steps>
    </Card>
  );
};

const getTitle = ({
  title,
  status,
  type,
}: {
  title: any[any];
  status: string;
  type: 'upload' | 'transcode' | 'transcribe' | 'edit' | 'align';
}): string =>
  title[status ?? 'default'] ??
  (LABELS[type] as any)['title'][status ?? 'default'] ??
  (LABELS[type] as any)['title'][null ?? 'default'];

const getDescription = ({
  description,
  status,
  type,
}: {
  description: any[any];
  status: string;
  type: 'upload' | 'transcode' | 'transcribe' | 'edit' | 'align';
}): string =>
  description?.[status ?? 'default'] ??
  description?.[null ?? 'default'] ??
  (LABELS[type] as any)['description'][status ?? 'default'] ??
  LABELS[type]['description'][null ?? 'default'];

const Audio = ({ key }: { key: string }): JSX.Element => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    key &&
      (async () =>
        setSrc(
          await Storage.get(key.replace('public/', ''), {
            download: false,
            expires: 36000,
          }),
        ))();
  }, [key]);

  // TODO 404 audio src?
  return (
    <audio controls src={src ?? ''} style={{ width: '100%' }}>
      {' '}
    </audio>
  );
};

export function foo(bar: string): string {
  return bar;
}

export default StatusCard;

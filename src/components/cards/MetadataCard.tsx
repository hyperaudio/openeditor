/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/label-has-associated-control */
import React, { useCallback, useState, useMemo } from 'react';
import { DataStore } from 'aws-amplify';
import { useAtom } from 'jotai';
import { Card, Input, InputNumber, Space, Button, Radio, RadioChangeEvent } from 'antd';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import TC, { FRAMERATE } from 'smpte-timecode';

import { debugModeAtom } from '../../atoms';
import { User, Transcript } from '../../models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MetadataCard = ({
  transcript,
  user,
  speakers,
  setSpeakers,
  frameRate: frameRateProp,
  offset: offsetProp,
}: {
  transcript: Transcript | undefined;
  user: User | undefined;
  speakers: { [key: string]: any };
  setSpeakers: (speakers: { [key: string]: any }) => void;
  frameRate: number;
  offset: string;
}): JSX.Element | null => {
  const [title, setTitle] = useState(transcript?.title);
  const [frameRate, setFrameRate] = useState<number>(frameRateProp);
  const [rawOffset, setRawOffset] = useState<string>(offsetProp);
  const [offset, setOffset] = useState<string>(offsetProp);
  const [offsetError, setOffsetError] = useState<boolean>(false);
  const [debugMode] = useAtom(debugModeAtom);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: title } = e.target;
      if (title) setTitle(title);
    },
    [setTitle],
  );

  const updateTitle = useCallback(
    async (e: any) => {
      const original = await DataStore.query(Transcript, transcript?.id as string);
      if (!original) return;
      await DataStore.save(
        Transcript.copyOf(original, (updated: any) => {
          // eslint-disable-next-line no-param-reassign
          updated.title = title;
        }),
      );
    },
    [transcript, title],
  );

  const handleFrameRateChange = useCallback(
    (e: RadioChangeEvent) => {
      const { value } = e.target;
      if (value) setFrameRate(value);
    },
    [setFrameRate],
  );

  const handleRawOffsetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      try {
        const tc = new TC(value.trim(), frameRate as FRAMERATE);
        setOffset(tc.toString());
        setOffsetError(false);
      } catch (error) {
        setOffsetError(true);
      }
      setRawOffset(value.trim());
    },
    [frameRate],
  );

  const rawOffsetValue = useMemo(() => {
    try {
      const tc = new TC(rawOffset.trim(), frameRate as FRAMERATE);
      setOffset(tc.toString());
      setOffsetError(false);
      return tc.toString();
    } catch (ignored) {
      setOffsetError(true);
      return rawOffset.trim();
    }
  }, [rawOffset, frameRate]);

  const dropFrame = useMemo(() => offset.indexOf(';') > -1, [offset]);

  const handleApplyOffset = useCallback(
    async (e: any) => {
      const original = await DataStore.query(Transcript, transcript?.id as string);
      if (!original) return;
      await DataStore.save(
        Transcript.copyOf(original, (updated: any) => {
          // eslint-disable-next-line no-param-reassign
          updated.metadata = JSON.stringify({ ...(original as any)?.metadata, frameRate, offset });
        }),
      );
    },
    [transcript, frameRate, offset],
  );

  return (
    <Space style={{ width: '100%' }} direction="vertical" size="large">
      <Card size="small" title="Metadata">
        <Space style={{ width: '100%' }} direction="vertical" size="large">
          <Space style={{ width: '100%' }} direction="vertical" size="small">
            <span>Title</span>
            <Input.Group compact>
              <Input style={{ width: 'calc(100% - 100px)' }} value={title} onChange={handleTitleChange} />
              <Button type="primary" onClick={updateTitle}>
                Update
              </Button>
            </Input.Group>
          </Space>

          <Space style={{ width: '100%' }} direction="vertical" size="small">
            <span>Speaker names</span>
            {Object.keys(speakers).map(speakerId => (
              <SpeakerNameInput key={speakerId} id={speakerId} speakers={speakers} setSpeakers={setSpeakers} />
            ))}
          </Space>
        </Space>
      </Card>
      <Card size="small" title="Timecode">
        <Space style={{ width: '100%' }} direction="vertical" size="small">
          <span>Offset</span>
          <Input value={rawOffsetValue} status={offsetError ? 'error' : undefined} onChange={handleRawOffsetChange} />
          {/* <Button icon={<SearchOutlined />} disabled /> */}
          <span>Frame rate ({dropFrame ? 'drop-frame' : 'non-drop-frame'})</span>
          <Radio.Group onChange={handleFrameRateChange} value={frameRate}>
            <Radio value={23.976}>23.976</Radio>
            <Radio value={24}>24</Radio>
            <Radio value={25}>25</Radio>
            <Radio value={29.97}>29.97</Radio>
            <Radio value={30}>30</Radio>
            <Radio value={50}>50</Radio>
            <Radio value={59.94}>59.94</Radio>
            <Radio value={60}>60</Radio>
          </Radio.Group>

          <Button type="primary" disabled={offsetError} onClick={handleApplyOffset}>
            Apply {offset.toString()} offset
          </Button>
        </Space>
      </Card>
    </Space>
  );
};

const SpeakerNameInput = ({
  id,
  speakers,
  setSpeakers,
}: {
  id: string;
  speakers: { [key: string]: any };
  setSpeakers: (speakers: { [key: string]: any }) => void;
}): JSX.Element => {
  const speaker = useMemo(() => speakers[id], [speakers, id]);
  const [name, setName] = useState(speaker.name);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: name } = e.target;
      if (name) setName(name);
    },
    [setName],
  );

  const updateSpeakerName = useCallback(
    (e: any) => {
      setSpeakers({ ...speakers, [id]: { ...speaker, name } });
    },
    [id, speaker, name, speakers, setSpeakers],
  );

  return (
    <Input.Group compact>
      <Input style={{ width: 'calc(100% - 100px)' }} value={name} onChange={handleNameChange} />
      <Button type="primary" onClick={updateSpeakerName}>
        Update
      </Button>
    </Input.Group>
  );
};

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

export default MetadataCard;

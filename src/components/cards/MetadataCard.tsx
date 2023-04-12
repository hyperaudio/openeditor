/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/label-has-associated-control */
import React, { useCallback, useState, useMemo } from 'react';
import { DataStore } from 'aws-amplify';
import { useAtom } from 'jotai';
import { Card, Input, Space, Button } from 'antd';

import { debugModeAtom } from '../../atoms';
import { User, Transcript } from '../../models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MetadataCard = ({
  transcript,
  user,
  speakers,
  setSpeakers,
}: {
  transcript: Transcript | undefined;
  user: User | undefined;
  speakers: { [key: string]: any };
  setSpeakers: (speakers: { [key: string]: any }) => void;
}): JSX.Element | null => {
  const [title, setTitle] = useState(transcript?.title);
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

  return (
    <Card size="small">
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
            <SpeakerNameInput id={speakerId} speakers={speakers} setSpeakers={setSpeakers} />
          ))}
        </Space>
      </Space>
    </Card>
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
export default MetadataCard;

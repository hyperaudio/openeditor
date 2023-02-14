/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/label-has-associated-control */
import React, { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { Card, Input, Space, Button } from 'antd';

import { debugModeAtom } from '../atoms';
import { User, Transcript } from '../models';

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
  const [debugMode] = useAtom(debugModeAtom);

  return (
    <Card size="small">
      <Space style={{ width: '100%' }} direction="vertical" size="large">
        <Space style={{ width: '100%' }} direction="vertical" size="small">
          <span>Title</span>
          <Input.Group compact>
            <Input style={{ width: 'calc(100% - 100px)' }} value={transcript?.title} />
            <Button type="primary">Update</Button>
          </Input.Group>
        </Space>

        <Space style={{ width: '100%' }} direction="vertical" size="small">
          <span>Speaker names</span>
          {Object.keys(speakers).map(speakerId => (
            <Input.Group compact>
              <Input style={{ width: 'calc(100% - 100px)' }} value={speakers[speakerId].name} />
              <Button type="primary">Update</Button>
            </Input.Group>
          ))}
        </Space>
      </Space>
    </Card>
  );
};

export default MetadataCard;

/* eslint-disable react/jsx-curly-brace-presence, jsx-a11y/label-has-associated-control */
import React, { useCallback, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { Avatar, Dropdown, Button, Space, Switch, Drawer, InputNumber } from 'antd';
import { DownOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import hash from 'object-hash';

import { User } from '../models';
import { darkModeAtom, measureAtom, transportAtTopAtom, showFullTimecodeAtom, playerPositionAtom } from '../atoms';

interface UserMenuProps {
  user: User | undefined;
  groups: string[];
  signOut: () => void;
}

const UserMenu = ({ user, groups, signOut }: UserMenuProps): JSX.Element => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const [measure, setMeasure] = useAtom(measureAtom);
  const [transportAtTop, setTransportAtTop] = useAtom(transportAtTopAtom);
  const [showFullTimecode, setShowFullTimecode] = useAtom(showFullTimecodeAtom);
  // const [playerPosition, setPlayerPosition] = useAtom(playerPositionAtom);

  const emailHash = useMemo(() => (user ? hash.MD5(user.email.trim().toLowerCase()) : null), [user]);

  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const closeSettingsDrawer = useCallback(() => setSettingsDrawerVisible(false), []);

  const handleClick = useCallback(
    ({ key }: { key: string }) => {
      if (key === '0') setSettingsDrawerVisible(true);
      if (key === '1') signOut();
      // if (key === '2') setDarkMode(!darkMode);
    },
    [signOut, darkMode, setDarkMode],
  );

  const handleDarkModeChange = useCallback((darkMode: boolean) => setDarkMode(darkMode), [setDarkMode]);
  const handleTransportChange = useCallback(
    (transportAtTop: boolean) => setTransportAtTop(transportAtTop),
    [setTransportAtTop],
  );
  const handleShowFullTimecodeChange = useCallback(
    (showFullTimecode: boolean) => setShowFullTimecode(showFullTimecode),
    [setShowFullTimecode],
  );
  const handleMeasureChange = useCallback(
    (measure: number | null) => {
      if (measure) setMeasure(measure);
    },
    [setMeasure],
  );
  // const resetPlayerPosition = useCallback(() => setPlayerPosition({ x: 2, y: 12 }), [setPlayerPosition]);

  return (
    <>
      <Dropdown
        trigger={['click']}
        menu={{
          onClick: handleClick,
          items: [
            {
              label: (
                <Space>
                  <SettingOutlined /> Preferences
                </Space>
              ),
              key: '0',
            },
            {
              label: (
                <Space>
                  <LogoutOutlined /> Sign Out
                </Space>
              ),
              key: '1',
            },
            {
              type: 'divider',
            },
            {
              label: (
                <Space>
                  <Switch size="small" checked={darkMode} onChange={handleDarkModeChange} disabled />
                  Dark mode
                </Space>
              ),
              key: '2',
            },
          ],
        }}>
        <div style={{ cursor: 'pointer' }}>
          <Avatar src={emailHash ? `https://www.gravatar.com/avatar/${emailHash}?d=404` : null}>
            {user?.name.charAt(0).toUpperCase()}
          </Avatar>
          <DownOutlined />
        </div>
      </Dropdown>
      <Drawer title="Settings" placement="right" onClose={closeSettingsDrawer} open={settingsDrawerVisible} width={600}>
        <Space direction="vertical" size="large">
          <Space>
            <Switch size="small" checked={darkMode} onChange={handleDarkModeChange} disabled />
            Dark mode
          </Space>
          <Space>
            <Switch size="small" checked={transportAtTop} onChange={handleTransportChange} />
            Media transport docked at top
          </Space>
          <Space>
            <Switch size="small" checked={showFullTimecode} onChange={handleShowFullTimecodeChange} />
            Show full timecode
          </Space>
          <Space>
            <InputNumber addonAfter="em" min={30} max={80} step={1} value={measure} onChange={handleMeasureChange} />
            editor measure (line length)
          </Space>
          {/* <Space>
            <Button onClick={resetPlayerPosition}>Reset player position</Button>
          </Space> */}
        </Space>
      </Drawer>
    </>
  );
};

export default UserMenu;

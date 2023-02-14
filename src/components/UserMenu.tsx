/* eslint-disable react/jsx-curly-brace-presence, jsx-a11y/label-has-associated-control */
import React, { useCallback, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { Avatar, Dropdown, Menu, Space, Switch, Drawer, InputNumber } from 'antd';
import { DownOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import hash from 'object-hash';

import { User } from '../models';
import { darkModeAtom, measureAtom, transportAtTopAtom, showFullTimecodeAtom } from '../atoms';

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
          <label>
            <Space>
              <Switch size="small" checked={darkMode} onChange={handleDarkModeChange} disabled />
              Dark mode
            </Space>
          </label>
          <label>
            <Space>
              <Switch size="small" checked={transportAtTop} onChange={handleTransportChange} />
              Media transport docked at top
            </Space>
          </label>
          <label>
            <Space>
              <Switch size="small" checked={showFullTimecode} onChange={handleShowFullTimecodeChange} />
              Show full timecode
            </Space>
          </label>
          <label>
            <Space>
              <InputNumber addonAfter="em" min={30} max={80} step={1} value={measure} onChange={handleMeasureChange} />
              editor measure (line length)
            </Space>
          </label>
        </Space>
      </Drawer>
    </>
  );
};

export default UserMenu;

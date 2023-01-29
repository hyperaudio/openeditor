/* eslint-disable react/jsx-curly-brace-presence */
import React, { useCallback, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { Avatar, Dropdown, Menu, Space, Switch, Drawer, InputNumber } from 'antd';
import { DownOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import hash from 'object-hash';

import { User } from '../models';
import { darkModeAtom, measureAtom } from '../atoms';

interface UserMenuProps {
  user: User | undefined;
  groups: string[];
  signOut: () => void;
}

const UserMenu = ({ user, groups, signOut }: UserMenuProps): JSX.Element => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const [measure, setMeasure] = useAtom(measureAtom);
  const emailHash = useMemo(() => (user ? hash.MD5(user.email.trim().toLowerCase()) : null), [user]);

  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const closeSettingsDrawer = useCallback(() => setSettingsDrawerVisible(false), []);

  const handleClick = useCallback(
    ({ key }: { key: string }) => {
      if (key === '0') setSettingsDrawerVisible(true);
      if (key === '1') signOut();
      if (key === '2') setDarkMode(!darkMode);
    },
    [signOut, darkMode, setDarkMode],
  );

  const handleChange = useCallback((darkMode: boolean) => setDarkMode(darkMode), [setDarkMode]);
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
                  <Switch size="small" checked={darkMode} onChange={handleChange} />
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
            <Switch size="small" checked={darkMode} onChange={handleChange} />
            Dark mode
          </Space>
          <Space>
            <InputNumber addonAfter="em" min={30} max={80} step={1} value={measure} onChange={handleMeasureChange} />
            editor measure (line length)
          </Space>
        </Space>
      </Drawer>
    </>
  );
};

export default UserMenu;

/* eslint-disable react/jsx-curly-brace-presence */
import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Avatar, Dropdown, Menu, Space, Switch } from 'antd';
import { DownOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import hash from 'object-hash';

import { User } from '../models';
import { darkModeAtom } from '../atoms';

interface UserMenuProps {
  user: User | undefined;
  groups: string[];
  signOut: () => void;
}

const UserMenu = ({ user, groups, signOut }: UserMenuProps): JSX.Element => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const emailHash = useMemo(() => (user ? hash.MD5(user.email.trim().toLowerCase()) : null), [user]);

  const handleClick = useCallback(
    ({ key }: { key: string }) => {
      if (key === '1') signOut();
      if (key === '2') setDarkMode(!darkMode);
    },
    [signOut, darkMode, setDarkMode],
  );

  const handleChange = useCallback((darkMode: boolean) => setDarkMode(darkMode), [setDarkMode]);

  return (
    <Dropdown
      trigger={['click']}
      overlay={
        <Menu
          onClick={handleClick}
          items={[
            {
              label: (
                <Link to="/preferences">
                  <Space>
                    <SettingOutlined /> Preferences
                  </Space>
                </Link>
              ),
              key: '0',
              disabled: true,
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
          ]}
        />
      }>
      <div style={{ cursor: 'pointer' }}>
        <Avatar src={emailHash ? `https://www.gravatar.com/avatar/${emailHash}?d=404` : null}>
          {user?.name.charAt(0).toUpperCase()}
        </Avatar>
        <DownOutlined />
      </div>
    </Dropdown>
  );
};

export default UserMenu;

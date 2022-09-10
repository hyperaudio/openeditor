/* eslint-disable react/jsx-curly-brace-presence */
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Avatar, Dropdown, Menu, Space, Switch } from 'antd';
import { DownOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';

import { User } from '../models';

interface UserMenuProps {
  user: User | undefined;
  groups: string[];
  signOut: () => void;
}

const UserMenu = ({ user, groups, signOut }: UserMenuProps): JSX.Element => {
  const [darkMode, setDarkMode] = useState(false);

  const handleClick = useCallback(
    ({ key }: { key: string }) => {
      if (key === '1') signOut();
      if (key === '2') setDarkMode(!darkMode);
    },
    [signOut, darkMode],
  );

  const handleChange = useCallback((darkMode: boolean) => {
    setDarkMode(darkMode);
    window.darkMode = darkMode;
  }, []);

  return (
    <>
      {darkMode && (
        <Helmet>
          <style>{'@import "/style/antd.dark.css";'}</style>
        </Helmet>
      )}
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
          <Avatar>{user?.name.charAt(0).toUpperCase()}</Avatar>
          <DownOutlined />
        </div>
      </Dropdown>
    </>
  );
};

export default UserMenu;

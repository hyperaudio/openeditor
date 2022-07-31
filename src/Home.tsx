import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, PageHeader, Button } from 'antd';

import { User } from './models';

const { Header, Content } = Layout;

interface HomeProps {
  user: User | undefined;
  groups: string[];
  userMenu: JSX.Element;
}

const Home = ({ user, groups, userMenu }: HomeProps): JSX.Element => {
  console.log('Home');

  return (
    <Layout>
      <PageHeader title="OpenEditor" extra={userMenu} />
      <Content>
        <Link to="/new">
          <Button>New Transcript</Button>
        </Link>
      </Content>
    </Layout>
  );
};

export default Home;

/* eslint-disable react/button-has-type */
import React from 'react';
import { Auth } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { Layout, PageHeader, Avatar } from 'antd';

const { Content } = Layout;

const App = (): JSX.Element => {
  const { route, user, signOut } = useAuthenticator(context => [context.user]);

  console.log({ route, user, signOut });
  // const identityId = (await Auth.currentCredentials()).identityId;

  return route === 'authenticated' ? (
    <Layout>
      <PageHeader
        className="site-page-header"
        onBack={() => null}
        title="Title"
        subTitle="This is a subtitle"
        extra={<Avatar>L</Avatar>}
      />
      <Content>
        <button onClick={signOut}>Sign Out</button>
      </Content>
    </Layout>
  ) : (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Authenticator hideSignUp />
    </div>
  );
};

export default App;

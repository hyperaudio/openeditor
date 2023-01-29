import React from 'react';
import { Authenticator, ThemeProvider, Theme } from '@aws-amplify/ui-react';
import { Typography, Layout } from 'antd';

import Footer from '../components/Footer';

const { Title } = Typography;

interface AuthProps {
  theme: Theme;
  darkMode: boolean;
}

const Auth = ({ theme, darkMode }: AuthProps): JSX.Element => (
  <Layout>
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <ThemeProvider theme={theme} colorMode={darkMode ? 'dark' : 'light'}>
        <Title style={{ textAlign: 'center' }}>OpenEditor</Title>
        <Authenticator hideSignUp />
        <Footer />
      </ThemeProvider>
    </div>
  </Layout>
);

export default Auth;

import React from 'react';
import { Authenticator, ThemeProvider, Theme } from '@aws-amplify/ui-react';

interface AuthProps {
  theme: Theme;
  darkMode: boolean;
}

const Auth = ({ theme, darkMode }: AuthProps): JSX.Element => (
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
      <Authenticator hideSignUp />
    </ThemeProvider>
  </div>
);

export default Auth;

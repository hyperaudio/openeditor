/* eslint-disable no-unused-expressions */
/* eslint-disable react/button-has-type */
import React, { useState, useEffect, useMemo } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Auth, DataStore, Hub } from 'aws-amplify';
import { ThemeProvider, defaultDarkModeOverride, Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

import { User, Transcript } from './models';
import Home from './pages/Home';
import TranscriptPage from './pages/Transcript';
import NotFound from './pages/NotFound';
import UserMenu from './components/UserMenu';

export const theme = {
  name: 'open-editor',
  overrides: [defaultDarkModeOverride],
};

const getUser = async (username: string): Promise<User | undefined> =>
  (await DataStore.query(User, user => user.cognitoUsername('eq', username), { limit: 1 })).pop();

const getUsers = async (setUsers: (users: User[]) => void): Promise<void> => setUsers(await DataStore.query(User));
const getTranscripts = async (setTranscripts: (transcripts: Transcript[]) => void): Promise<void> =>
  setTranscripts(await DataStore.query(Transcript));

const App = (): JSX.Element => {
  const { authStatus, user: cognitoUser, signOut } = useAuthenticator(context => [context.user]);

  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<User[] | undefined>(undefined);
  const [transcripts, setTranscripts] = useState<Transcript[] | undefined>(undefined);

  useEffect(() => {
    getUsers(setUsers);

    const subscription = DataStore.observe(User).subscribe(() => getUsers(setUsers));
    window.addEventListener('online', () => navigator.onLine && getUsers(setUsers));

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    getTranscripts(setTranscripts);

    const subscription = DataStore.observe(Transcript).subscribe(() => getTranscripts(setTranscripts));
    window.addEventListener('online', () => navigator.onLine && getTranscripts(setTranscripts));

    return () => subscription.unsubscribe();
  }, []);

  const user = useMemo(
    () => users?.find(({ cognitoUsername }) => cognitoUsername === cognitoUser?.username),
    [cognitoUser, users],
  );

  const groups = useMemo(
    () => cognitoUser?.getSignInUserSession()?.getIdToken().payload['cognito:groups'],
    [cognitoUser],
  );

  useEffect(() => {
    Hub.listen('datastore', ({ payload: { event, data } }) => {
      if (event === 'ready') setReady(true);
    });

    // return () => Hub.remove('datastore', listener);
  }, []);

  useEffect(() => {
    if (!cognitoUser || !ready) return;

    const { username, attributes } = cognitoUser;
    const { email } = attributes ?? { email: '' };

    username &&
      (async () => {
        const user = await getUser(username);

        if (!user) {
          const { identityId } = await Auth.currentCredentials();

          await DataStore.save(
            new User({
              identityId,
              cognitoUsername: username,
              email,
              name: email.split('@')[0],
              metadata: '{}',
            }),
          );
        }
      })();
  }, [cognitoUser, ready]);

  return authStatus === 'authenticated' ? (
    <Switch>
      <Route path="/" exact>
        <Home {...{ user, groups, transcripts }} userMenu={<UserMenu {...{ user, groups, signOut }} />} />
      </Route>
      <Route path="/:uuid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})">
        <TranscriptPage {...{ user, groups, transcripts }} userMenu={<UserMenu {...{ user, groups, signOut }} />} />
      </Route>
      <Route path="*">
        <NotFound />
      </Route>
    </Switch>
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
      <ThemeProvider theme={theme} colorMode={window.darkMode ? 'dark' : 'light'}>
        <Authenticator hideSignUp />
      </ThemeProvider>
    </div>
  );
};

export default App;

/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/button-has-type */
import React, { useState, useEffect, useMemo } from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Auth, DataStore, Hub } from 'aws-amplify';
import { defaultDarkModeOverride, useAuthenticator } from '@aws-amplify/ui-react';
import { useAtom } from 'jotai';
import { useKonami } from 'react-konami-code';

import { User, Transcript, Folder } from './models';
import { darkModeAtom, debugModeAtom } from './atoms';
import AuthPage from './pages/Auth';
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
const getFolders = async (setFolders: (folders: Folder[]) => void): Promise<void> =>
  setFolders(await DataStore.query(Folder));

const AppWrapper = (): JSX.Element => {
  const { authStatus } = useAuthenticator(context => [context.user]);
  const [darkMode] = useAtom(darkModeAtom);

  return (
    <>
      {darkMode && (
        <Helmet>
          <style>{'@import "/style/antd.dark.css";'}</style>
        </Helmet>
      )}
      {authStatus === 'authenticated' ? <App /> : <AuthPage {...{ theme, darkMode }} />}
    </>
  );
};

const App = (): JSX.Element => {
  const { user: cognitoUser, signOut } = useAuthenticator(context => [context.user]);

  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<User[] | undefined>(undefined);
  const [transcripts, setTranscripts] = useState<Transcript[] | undefined>(undefined);
  const [folders, setFolders] = useState<Folder[] | undefined>(undefined);

  const [debugMode, setDebug] = useAtom(debugModeAtom);
  useKonami(() => setDebug(!debugMode));

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

  useEffect(() => {
    getFolders(setFolders);

    const subscription = DataStore.observe(Folder).subscribe(() => getFolders(setFolders));
    window.addEventListener('online', () => navigator.onLine && getFolders(setFolders));

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

  return (
    <Switch>
      <Route path="/" exact>
        <PageWrapper
          {...{ user, users, groups, folders, transcripts, userMenu: <UserMenu {...{ user, groups, signOut }} /> }}
        />
        {/* <Home {...{ user, groups, folders, transcripts }} userMenu={<UserMenu {...{ user, groups, signOut }} />} /> */}
      </Route>
      <Route path="/:uuid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})">
        <PageWrapper
          {...{ user, users, groups, folders, transcripts, userMenu: <UserMenu {...{ user, groups, signOut }} /> }}
        />
        {/* <TranscriptPage {...{ user, groups, transcripts }} userMenu={<UserMenu {...{ user, groups, signOut }} />} /> */}
      </Route>
      <Route path="*">
        <NotFound />
      </Route>
    </Switch>
  );
};

interface PageWrapperProps {
  user: User | undefined;
  users: User[] | undefined;
  groups: string[];
  folders: Folder[] | undefined;
  transcripts: Transcript[] | undefined;
  userMenu: JSX.Element;
}

const PageWrapper = ({ user, users, groups, folders, transcripts, userMenu }: PageWrapperProps): JSX.Element => {
  const params = useParams();
  const { uuid } = params as Record<string, string>;

  console.log({ uuid, folders, transcripts });

  const folder = useMemo(() => folders?.find(({ id }) => id === uuid), [folders, uuid]);
  const transcript = useMemo(() => transcripts?.find(({ id }) => id === uuid), [transcripts, uuid]);

  useEffect(() => window.scrollTo(0, 0), [uuid]);

  return folder || !uuid ? (
    <Home {...{ uuid, user, users, groups, folder, folders, transcripts, userMenu }} />
  ) : transcript ? (
    <TranscriptPage {...{ uuid, user, groups, folders, transcript, transcripts, userMenu }} />
  ) : (
    <NotFound />
  );
};

export default AppWrapper;

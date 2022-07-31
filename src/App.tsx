/* eslint-disable no-unused-expressions */
/* eslint-disable react/button-has-type */
import React, { useState, useEffect, useMemo } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { Auth, DataStore, Predictions } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

import { User, Transcript } from './models';
import Home from './Home';
import TranscriptPage from './Transcript';
import NotFound from './NotFound';
import UserMenu from './components/UserMenu';

const getUser = async (username: string): Promise<User | undefined> =>
  (await DataStore.query(User, user => user.cognitoUsername('eq', username), { limit: 1 })).pop();

const getUsers = async (setUsers: (users: User[]) => void): Promise<void> => setUsers(await DataStore.query(User));
const getTranscripts = async (setTranscripts: (transcripts: Transcript[]) => void): Promise<void> =>
  setTranscripts(await DataStore.query(Transcript));

const App = (): JSX.Element => {
  const { authStatus, user: cognitoUser, signOut } = useAuthenticator(context => [context.user]);

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
    if (!cognitoUser || !users) return;

    const { username, attributes } = cognitoUser;
    const { email } = attributes ?? { email: '' };

    console.log({ username, email });

    // username &&
    //   (async () => {
    //     const user = await getUser(username);
    //     console.log({ user });

    //     if (!user) {
    //       const { identityId } = await Auth.currentCredentials();

    //       await DataStore.save(
    //         new User({
    //           identityId,
    //           cognitoUsername: username,
    //           email,
    //           name: email.split('@')[0],
    //           metadata: '{}',
    //         }),
    //       );
    //     }

    //     // await DataStore.save(
    //     //   User.copyOf(user, updated => {
    //     //     // eslint-disable-next-line no-param-reassign
    //     //     updated.metadata = JSON.stringify({
    //     //       ...((user.metadata as unknown as Record<string, unknown>) ?? {}),
    //     //       lastLogin: new Date(),
    //     //     });
    //     //   }),
    //     // );
    //   })();
  }, [cognitoUser, users]);

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
      <Authenticator hideSignUp />
    </div>
  );
};

export default App;

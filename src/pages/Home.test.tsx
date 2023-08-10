/* eslint-disable import/no-extraneous-dependencies */
import 'jsdom-worker';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { User } from '../models';

import Home from './Home';

test('renders OpenEditor', () => {
  const user = new User({
    identityId: '',
    cognitoUsername: '',
    email: '',
    name: 'Test',
    metadata: '{}',
  });

  render(
    <Home
      uuid={undefined}
      user={user}
      users={[]}
      groups={[]}
      userMenu={<span>test</span>}
      project={undefined}
      projects={[]}
      projectGroup={undefined}
      folder={undefined}
      folders={[]}
      transcripts={[]}
      root={undefined}
      routes={[]}
    />,
  );
  const linkElement = screen.getByText(/OpenEditor/i);
  expect(linkElement).toBeInTheDocument();
});

// TODO see https://www.npmjs.com/package/jest-matchmedia-mock

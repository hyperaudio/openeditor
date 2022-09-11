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

  render(<Home user={user} groups={[]} userMenu={<span>test</span>} transcripts={[]} />);
  const linkElement = screen.getByText(/OpenEditor/i);
  expect(linkElement).toBeInTheDocument();
});

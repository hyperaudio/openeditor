import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'jotai';
import { ConfigProvider } from 'antd';
import enGB from 'antd/es/locale/en_GB';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import * as Sentry from '@sentry/react';

import awsExports from './aws-exports';
import App from './App';
import reportWebVitals from './reportWebVitals';

import './index.css';

window.Amplify = Amplify;

const { NODE_ENV, REACT_APP_SENTRY, REACT_APP_GIT_DESCRIBE } = process.env;
// eslint-disable-next-line no-unused-expressions
REACT_APP_SENTRY &&
  Sentry.init({
    dsn: REACT_APP_SENTRY,
    environment: NODE_ENV,
    release: REACT_APP_GIT_DESCRIBE && REACT_APP_GIT_DESCRIBE !== '' ? REACT_APP_GIT_DESCRIBE : 'n/a',
    integrations: [new Sentry.Replay()],
    // Performance Monitoring
    // tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });

Amplify.configure(awsExports);
// ConfigProvider.config({});

const rootElement: HTMLElement | null = document.getElementById('root');

if (rootElement)
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider>
        <ConfigProvider locale={enGB}>
          <Authenticator.Provider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Authenticator.Provider>
        </ConfigProvider>
      </Provider>
    </React.StrictMode>,
  );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

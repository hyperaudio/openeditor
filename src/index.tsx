import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enGB from 'antd/es/locale/en_GB';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';

import awsExports from './aws-exports';
import App from './App';
import reportWebVitals from './reportWebVitals';

import './index.css';

Amplify.configure(awsExports);
// ConfigProvider.config({});

const rootElement: HTMLElement | null = document.getElementById('root');

if (rootElement)
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ConfigProvider locale={enGB}>
        <Authenticator.Provider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Authenticator.Provider>
      </ConfigProvider>
    </React.StrictMode>,
  );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

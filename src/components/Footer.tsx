import React, { useMemo } from 'react';
import { Layout } from 'antd';

const Footer = (): JSX.Element => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <Layout.Footer>
      <small style={{ display: 'block', textAlign: 'center' }}>
        All code open source,{' '}
        <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer">
          GNU AGPL Licensed
        </a>{' '}
        and available on{' '}
        <a href="https://github.com/OpenEditor/openeditor" target="_blank" rel="noopener noreferrer">
          github.com/OpenEditor
        </a>{' '}
        <span>&copy;2019&#8211;{currentYear}</span>
      </small>
    </Layout.Footer>
  );
};

export default Footer;

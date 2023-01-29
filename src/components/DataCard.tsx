import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import ReactJson from 'react-json-view';
import { Card } from 'antd';

import { darkModeAtom, debugModeAtom } from '../atoms';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataCard = ({ objects }: { objects: any }): JSX.Element | null => {
  const [darkMode] = useAtom(darkModeAtom);
  const [debugMode] = useAtom(debugModeAtom);

  const keys = useMemo(() => Object.keys(objects).sort(), [objects]);

  return debugMode ? (
    <Card title="Data" size="small" style={{ minWidth: '50vw', maxWidth: '75vw', margin: '2em auto' }}>
      {keys.map(key => (
        <ReactJson
          key={key}
          name={key}
          iconStyle="circle"
          quotesOnKeys={false}
          displayDataTypes={false}
          displayObjectSize={false}
          src={objects[key] ?? {}}
          theme={darkMode ? 'summerfruit' : 'summerfruit:inverted'}
          collapsed
        />
      ))}
    </Card>
  ) : null;
};

export default DataCard;

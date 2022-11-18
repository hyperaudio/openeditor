import React, { useMemo, useState, useCallback, useEffect, forwardRef } from 'react';
import { Storage } from 'aws-amplify';
import { useAtom } from 'jotai';
import Draggable from 'react-draggable';
import ReactPlayer from 'react-player';

import { playerPositionAtom, darkModeAtom } from '../atoms';

interface PlayerProps {
  audioKey: string | null;
  playing: boolean;
  play: () => void;
  pause: () => void;
  setTime: (time: number) => void;
}

const Player = forwardRef<ReactPlayer, PlayerProps>(
  ({ audioKey, playing, play, pause, setTime }: PlayerProps, ref): JSX.Element | null => {
    const audio = true;

    const [darkMode] = useAtom(darkModeAtom);
    const [position, setPosition] = useAtom(playerPositionAtom);
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
      // eslint-disable-next-line no-unused-expressions
      audioKey &&
        (async () =>
          setUrl(
            await Storage.get(audioKey.replace('public/', ''), {
              download: false,
              expires: 36000,
            }),
          ))();
    }, [audioKey]);

    const handleDragStop = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any, data: any) => {
        const { x, y } = data;
        setPosition({ x, y });
      },
      [setPosition],
    );

    const config = useMemo(
      () => ({
        forceAudio: audio,
        forceVideo: !audio,
        file: {
          attributes: {
            // poster: 'https://via.placeholder.com/720x576.png?text=4:3',
            controlsList: 'nodownload',
          },
        },
      }),
      [audio],
    );

    const onDuration = useCallback((duration: number) => {
      console.log({ duration });
    }, []);

    const onProgress = useCallback(({ playedSeconds }: { playedSeconds: number }) => setTime(playedSeconds), [setTime]);

    return url ? (
      <div style={{ position: 'fixed', top: 0, height: 0, zIndex: 999 }}>
        <Draggable defaultPosition={position} onStop={handleDragStop} handle=".handle">
          <div
            className="handle"
            style={{
              width: '300px',
              backgroundColor: audio && !darkMode ? 'white' : 'black',
              padding: '6px',
              zIndex: 999,
              boxShadow: '0 0 15px gray',
              aspectRatio: audio ? '16/3' : '16/9',
              cursor: 'move',
            }}>
            <ReactPlayer
              controls
              {...{ ref, url, config, playing, onDuration, onProgress }}
              onPlay={play}
              onPause={pause}
              progressInterval={100}
              width="100%"
              height="100%"
            />
          </div>
        </Draggable>
        <style scoped>
          {`
            audio {
              background-color: ${darkMode ? 'black' : 'white'};
            }
          `}
        </style>
      </div>
    ) : null;
  },
);

export default Player;

import React, { useMemo, useState, useCallback, useEffect, forwardRef } from 'react';
import { Storage } from 'aws-amplify';
import { useAtom } from 'jotai';
import Draggable from 'react-draggable';
import ReactPlayer from 'react-player';
import axios from 'axios';

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
    // const audio = false;

    const [darkMode] = useAtom(darkModeAtom);
    const [position, setPosition] = useAtom(playerPositionAtom);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioHLSUrl, setAudioHLSUrl] = useState<string | null>(null);
    const [videoHLSUrl, setVideoHLSUrl] = useState<string | null>(null);

    useEffect(() => {
      // eslint-disable-next-line no-unused-expressions
      audioKey &&
        (async () => {
          const signedAudioUrl = await Storage.get(audioKey.replace('public/', ''), {
            download: false,
            expires: 36000,
          });
          setAudioUrl(signedAudioUrl);

          let audioUrl;
          try {
            const audioM3U8Key = audioKey
              .replace('public/media/audio', 'media/hls')
              .replace('-transcoded.m4a', '-audio.m3u8');

            const signedAudioM3U8Url = await Storage.get(audioM3U8Key, {
              download: false,
              expires: 36000,
            });

            const { data: audioM3U8 } = await axios.get(signedAudioM3U8Url);
            const folder = audioM3U8Key.split('/').slice(0, -1).join('/');
            // console.log('audioM3U8', audioM3U8);

            const signedAudioM3U8 = (
              await Promise.all(
                audioM3U8.split('\n').map(async (line: string) => {
                  if (line.startsWith('#') || line.length === 0) return line;
                  return Storage.get(`${folder}/${line.trim()}`, {
                    download: false,
                    expires: 36000,
                  });
                }),
              )
            ).join('\n');
            // console.log('signedAudioM3U8', signedAudioM3U8);
            const segments = audioM3U8.split('\n').filter((line: string) => !line.startsWith('#')).length;
            // console.log(
            //   'segments',
            //   segments,
            //   audioM3U8,
            //   audioM3U8.split('\n').filter((line: string) => !line.startsWith('#')),
            // );

            const audioBlob = new Blob([signedAudioM3U8], { type: 'application/x-mpegURL' });
            audioUrl = URL.createObjectURL(audioBlob);
            if (segments > 3) setAudioHLSUrl(audioUrl);
            // eslint-disable-next-line no-empty
          } catch (ignored) {}

          let videoUrl;
          try {
            const videoM3U8Key = audioKey
              .replace('public/media/audio', 'media/hls')
              .replace('-transcoded.m4a', '-video_1.m3u8');

            const signedVideoM3U8Url = await Storage.get(videoM3U8Key, {
              download: false,
              expires: 36000,
            });

            const { data: videoM3U8 } = await axios.get(signedVideoM3U8Url);
            const folder = videoM3U8Key.split('/').slice(0, -1).join('/');

            const signedVideoM3U8 = (
              await Promise.all(
                videoM3U8.split('\n').map(async (line: string) => {
                  if (line.startsWith('#') || line.length === 0) return line;
                  return Storage.get(`${folder}/${line.trim()}`, {
                    download: false,
                    expires: 36000,
                  });
                }),
              )
            ).join('\n');
            const segments = videoM3U8.split('\n').filter((line: string) => !line.startsWith('#')).length;

            const videoBlob = new Blob([signedVideoM3U8], { type: 'application/x-mpegURL' });
            videoUrl = URL.createObjectURL(videoBlob);
            if (segments > 3) setVideoHLSUrl(videoUrl);
            // eslint-disable-next-line no-empty
          } catch (ignored) {}

          // console.log({ videoUrl, audioUrl, signedAudioUrl });
        })();
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
        forceAudio: !videoHLSUrl,
        forceVideo: videoHLSUrl,
        forceHLS: audioHLSUrl || videoHLSUrl,
        file: {
          attributes: {
            // poster: 'https://via.placeholder.com/720x576.png?text=4:3',
            controlsList: 'nodownload',
          },
        },
      }),
      [audioHLSUrl, videoHLSUrl],
    );

    const onDuration = useCallback((duration: number) => {
      console.log({ duration });
    }, []);

    const url = useMemo(() => videoHLSUrl ?? audioHLSUrl ?? audioUrl, [audioHLSUrl, audioUrl, videoHLSUrl]);
    const audio = useMemo(() => !videoHLSUrl, [videoHLSUrl]);

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
              key={url}
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { Card, Radio, Space, Button, Select } from 'antd';
import Timecode from 'smpte-timecode';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import sanitize from 'sanitize-filename';
import { ContentState, RawDraftContentBlock } from 'draft-js';

import { debugModeAtom } from '../../atoms';
import { User, Transcript } from '../../models';

import type { RadioChangeEvent } from 'antd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ExportCard = ({
  transcript,
  user,
  content,
}: {
  transcript: Transcript | undefined;
  user: User | undefined;
  content:
    | {
        speakers: { [key: string]: any };
        blocks: RawDraftContentBlock[];
        contentState: ContentState;
      }
    | undefined;
}): JSX.Element | null => {
  const [debugMode] = useAtom(debugModeAtom);
  const [format, setFormat] = useState('text');
  const [jsonFormat, setJsonFormat] = useState('OEv2');
  const handleChange = useCallback((e: RadioChangeEvent): void => setFormat(e.target.value), []);
  const handleJSONChange = useCallback((value: string): void => setJsonFormat(value), []);

  const handleExport = useCallback(async () => {
    if (!transcript || !user || !content) return;
    console.log({ format, transcript, user, content });

    const { id, title } = transcript;
    const { speakers, blocks } = content;

    let blob: Blob;
    let filename: string;
    let object: any;
    let paragraphs: any[];

    switch (format) {
      case 'json':
        switch (jsonFormat) {
          case 'internal':
            object = { id, speakers, blocks };
            break;

          case 'OEv2':
            object = {
              id,
              title,
              paragraphs: blocks.map((block: RawDraftContentBlock) => ({
                speaker: speakers?.[block.data?.speaker]?.name,
                start: block.data?.start,
                end: block.data?.end,
                text: block.text,
                words: block.data?.items?.map(
                  (item: { start: number; end: number; text: string; offset: number; length: number }) => ({
                    start: item.start,
                    end: item.end,
                    text: item.text,
                    offset: item.offset,
                    length: item.length,
                  }),
                ),
              })),
            };
            break;

          case 'OEv1':
            paragraphs = blocks.map((block: RawDraftContentBlock) => ({
              speaker: speakers?.[block.data?.speaker]?.name,
              start: block.data?.start,
              end: block.data?.end,
              text: block.text,
              words: block.data?.items?.map(
                (item: { start: number; end: number; text: string; offset: number; length: number }) => ({
                  start: Math.floor(item.start * 1e3),
                  end: Math.floor(item.end * 1e3),
                  text: item.text,
                  offset: item.offset,
                  length: item.length,
                }),
              ),
            }));

            object = {
              id,
              title,
              content: {
                paragraphs,
                words: paragraphs.flatMap(paragraph => paragraph.words),
              },
            };
            break;

          case 'HAv1':
            paragraphs = blocks.map((block: RawDraftContentBlock) => ({
              speaker: speakers?.[block.data?.speaker]?.name,
              start: block.data?.start,
              end: block.data?.end,
              text: block.text,
              words: block.data?.items?.map(
                (item: { start: number; end: number; text: string; offset: number; length: number }) => ({
                  start: item.start,
                  end: item.end,
                  text: item.text,
                  offset: item.offset,
                  length: item.length,
                }),
              ),
            }));

            object = {
              id,
              _id: id,
              title,
              label: title,
              content: {
                paragraphs,
                words: paragraphs.flatMap(paragraph => paragraph.words),
              },
            };
            break;

          // see https://github.com/alexnorton/transcript-model
          case 'BBCv1':
            // eslint-disable-next-line no-case-declarations
            const speakerArray = Object.entries(speakers).map(([id, speaker]) => ({ ...speaker, id }));
            // eslint-disable-next-line no-case-declarations
            const segments = blocks.map((block: RawDraftContentBlock) => ({
              speaker: speakerArray.findIndex((speaker: any) => speaker.id === block.data?.speaker),
              start: block.data?.start,
              end: block.data?.end,
              // text: block.text,
              words: block.data?.items?.map(
                (item: { start: number; end: number; text: string; offset: number; length: number }) => ({
                  start: item.start,
                  end: item.end,
                  text: item.text,
                  // offset: item.offset,
                  // length: item.length,
                }),
              ),
            }));

            object = {
              id,
              title,
              speakers: speakerArray.map(({ name }) => ({ name })),
              segments,
            };
            break;

          default:
            return;
            break;
        }

        blob = new Blob([JSON.stringify(object, null, 2)], { type: 'application/json' });
        filename = `${sanitize(title).replace(/ /g, '_').replace(/\./g, '_')}.json`;
        break;

      case 'text':
        // eslint-disable-next-line no-case-declarations
        const text = blocks.map(block => `${speakers?.[block.data?.speaker]?.name}: ${block.text}`).join('\n\n');
        blob = new Blob([text], { type: 'text/plain' });
        filename = `${sanitize(title).replace(/ /g, '_').replace(/\./g, '_')}.txt`;
        break;

      case 'html':
        // eslint-disable-next-line no-case-declarations
        const article = window.document.createElement('article');
        // eslint-disable-next-line no-case-declarations
        const section = window.document.createElement('section');
        section.setAttribute('data-openeditor-id', id);
        article.appendChild(section);

        blocks.forEach(block => {
          const paragraph = window.document.createElement('p');

          if (speakers?.[block.data?.speaker]?.name) {
            const speaker = window.document.createElement('span');
            speaker.setAttribute('class', 'speaker');
            speaker.innerText = `${speakers?.[block.data?.speaker]?.name}: `;
            paragraph.appendChild(speaker);
          }

          block.data?.items.forEach((item: any) => {
            const word = window.document.createElement('span');
            word.setAttribute('data-m', Math.floor(item.start * 1e3).toString());
            word.setAttribute('data-d', Math.floor((item.end - item.start) * 1e3).toString());
            word.innerText = `${item.text} `;
            paragraph.appendChild(word);
          });

          section.appendChild(paragraph);
        });

        blob = new Blob([article.outerHTML], { type: 'text/html' });
        filename = `${sanitize(title).replace(/ /g, '_').replace(/\./g, '_')}.html`;
        break;

      case 'docx':
        // eslint-disable-next-line no-case-declarations
        const doc = new Document({
          title,
          creator: `OpenEditor (%REACT_APP_GIT_SHA%)`,
          sections: [
            {
              children: blocks.map(block => {
                const tc = new Timecode((block.data?.start ?? 0) * 30, 30).toString().split(':').slice(0, 3).join(':');

                const paragraph = new Paragraph({
                  children: [
                    new TextRun({ text: speakers?.[block.data?.speaker]?.name, bold: true }),
                    new TextRun(`\t[${tc}]\n`),
                    new TextRun(block.text),
                    new TextRun('\n'),
                  ],
                });

                return paragraph;
              }),
            },
          ],
        });

        blob = await Packer.toBlob(doc);
        filename = `${sanitize(title).replace(/ /g, '_').replace(/\./g, '_')}.docx`;
        break;

      default:
        return;
        break;
    }

    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }, [format, jsonFormat, transcript, user, content]);

  return (
    <Card size="small">
      <Radio.Group onChange={handleChange} value={format}>
        <Space direction="vertical" size="large">
          <Radio value="text">Text Document</Radio>
          <Radio value="docx">Word Document</Radio>
          <Space style={{ width: '100%' }}>
            <Radio value="json">JSON Format</Radio>
            <Select
              style={{ width: '100%' }}
              value={jsonFormat}
              onChange={handleJSONChange}
              options={[
                {
                  value: 'OEv2',
                  label: 'OpenEditor v2',
                },
                {
                  value: 'OEv1',
                  label: 'OpenEditor v1 (legacy)',
                },
                {
                  value: 'HAv1',
                  label: 'Hyperaudio v1',
                },
                {
                  value: 'HAv2',
                  label: 'Hyperaudio v2',
                  disabled: true,
                },
                {
                  value: 'BBCv1',
                  label: 'BBC Transcript Model',
                },
                {
                  value: 'internal',
                  label: 'internal format (for debugging)',
                },
              ]}
            />
          </Space>
          <Radio value="html">Interactive transcript HTML</Radio>
          <Button type="primary" disabled={!transcript || !user || !content} onClick={handleExport}>
            Export
          </Button>
        </Space>
      </Radio.Group>
    </Card>
  );
};

export default ExportCard;

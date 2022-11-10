const formatTranscript = (items, segments, debug = false) =>
  segments.map(segment => {
    const { start, end, speaker } = segment;
    const tokens = items.filter(({ start: s, end: e }) => start <= s && e <= end);

    const data = {
      items: tokens,
      speaker,
    };

    if (debug) data.segment = segment;

    return {
      data,
      text: tokens.map(({ text }) => text).join(' '),
      entityRanges: [],
      inlineStyleRanges: [],
    };
  });

export const convertTranscript = ({
  results: {
    transcripts: [{ transcript }],
    items,
    speaker_labels: { segments },
  },
}) => {
  const segments2 = segments.map(({ start_time, end_time, speaker_label: speaker }) => ({
    start: parseFloat(start_time),
    end: parseFloat(end_time),
    speaker,
  }));

  const items2 = items
    .map(({ start_time, end_time, type, alternatives: [{ content: text }] }) => ({
      start: parseFloat(start_time),
      end: parseFloat(end_time),
      type,
      text,
    }))
    .reduce((acc, { start, end, type, text }) => {
      if (acc.length === 0) return [{ start, end, text }];
      const p = acc.pop();

      if (type !== 'pronunciation') {
        p.text += text;
        return [...acc, p];
      }
      return [...acc, p, { start, end, text }];
    }, []);

  const tstt = formatTranscript(items2, segments2);

  let speakers = [...new Set(segments3.map(({ speaker }) => speaker))].filter(s => !!s);

  speakers = speakers.reduce((acc, speaker) => {
    const id = `S${nanoid(5)}`;
    return { ...acc, [id]: { name: speaker } }; // editor adds id inside
  }, {});

  const blocks = tstt.map(block => {
    const items = block.data.items.map((item, i, arr) => {
      const offset = arr.slice(0, i).reduce((acc, { text }) => acc + text.length + 1, 0);
      return { ...item, offset, length: item.text.length };
    });

    return {
      ...block,
      key: `B${nanoid(5)}`,
      data: {
        ...block.data,
        start: block.data.items?.[0]?.start ?? 0,
        end: block.data.items?.[block.data.items.length - 1]?.end ?? 0,
        speaker: Object.entries(speakers).find(([id, { name }]) => name === block.data.speaker)?.[0],
        items,
        stt: items,
      },
      entityRanges: [],
      inlineStyleRanges: [],
    };
  });

  const t = {
    speakers,
    blocks: blocks,
  };

  return t;
};

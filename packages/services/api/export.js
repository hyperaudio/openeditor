import AWS from 'aws-sdk';
import { success, failure, notFound } from './libs/response-lib';

const { TableName, GIT_COMMIT_SHORT: version } = process.env;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const transcripts = async (event, context) => {
  const { parent } = event.queryStringParameters;

  const  params = {
    TableName,
    IndexName: 'parent-index',
    KeyConditionExpression: 'parent = :parent',
    ExpressionAttributeValues: {
      ':parent': parent,
    },
    FilterExpression: 'attribute_not_exists(deleted)',
  };


  try {
    const result = await dynamoDb['query'](params).promise();

    const data = result.Items.filter(({ status }) => status === 'aligned').map(({PK: id, title, duration, src, createdAt, updatedAt}) => ({id, title, duration, src, createdAt, updatedAt}));


    return success({ data, version, debug: { params } });
  } catch (error) {
    return failure({ data: null, errors: [error], version, debug: { params } });
  }
};

export const transcript = async (event, context) => {
  try {
    const { PK } = event.pathParameters;

    const { Items: transcriptItems } = await dynamoDb['query']({
      TableName,
      KeyConditionExpression: 'PK = :PK and SK = :SK',
      ExpressionAttributeValues: { ':PK': PK, ':SK': 'v0_metadata' },
      FilterExpression: 'attribute_not_exists(deleted)',
    }).promise();

    if (!transcriptItems || transcriptItems.length === 0)
      return notFound({ data: { title: '404 Not Found', status: 404 } });

    const [
      { title, duration, src, blocks = [] },
    ] = transcriptItems;

    const { Items: blockItems } = await dynamoDb['query']({
      TableName,
      KeyConditionExpression: 'PK = :PK and begins_with(SK, :SK)',
      ExpressionAttributeValues: { ':PK': PK, ':SK': 'v0_block:' },
    }).promise();

    const content = blocks.map(key => blockItems.find(({ SK }) => SK === `v0_block:${key}`));
    const paragraphs = content.map(({ start, end }) => ({ start: start / 1e3, end: end / 1e3 }));
    const words = content.reduce((acc, { text, speaker, starts, ends, offsets, lengths}) => {
      const words = starts.map((start, i) => ({
        start: start / 1e3,
        end: ends[i] / 1e3,
        text: text.substring(offsets[i], offsets[i] + lengths[i]),
      }));

      return [...acc, { text: speaker }, { text: ':' }, ...words];
    }, []);

    const data = {
      title,
      src,
      duration,
      content: {
        words,
        paragraphs,
        speakers: [],
      },
    };

    return success({ data, version });
  } catch (error) {
    return failure({ data: null, errors: [error], version });
  }
};

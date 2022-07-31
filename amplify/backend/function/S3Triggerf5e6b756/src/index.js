/* Amplify Params - DO NOT EDIT
	API_OPENEDITOR_GRAPHQLAPIENDPOINTOUTPUT
	API_OPENEDITOR_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
/* eslint-disable */
// import { default as fetch, Request } from 'node-fetch';

const GRAPHQL_ENDPOINT = process.env.API_OPENEDITOR_GRAPHQLAPIENDPOINTOUTPUT;
const GRAPHQL_API_KEY = process.env.API_OPENEDITOR_GRAPHQLAPIIDOUTPUT;

exports.handler = async function (event) {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  console.log(`Bucket: ${bucket}`, `Key: ${key}`);

  //
  // https://docs.amplify.aws/guides/functions/graphql-from-lambda/q/platform/js/#query
  // https://docs.amplify.aws/guides/functions/graphql-from-lambda/q/platform/js/#mutation
};

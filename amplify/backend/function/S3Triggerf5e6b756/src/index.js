/* Amplify Params - DO NOT EDIT
	API_OPENEDITOR_GRAPHQLAPIENDPOINTOUTPUT
	API_OPENEDITOR_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
/* eslint-disable */
import crypto from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import {
  MediaConvertClient,
  DescribeEndpointsCommand,
  CreateJobCommand,
  GetJobCommand,
} from '@aws-sdk/client-mediaconvert';
import { TranscribeClient, StartTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { default as fetch, Request } from 'node-fetch';

const { Sha256 } = crypto;

const GRAPHQL_ENDPOINT = process.env.API_OPENEDITOR_GRAPHQLAPIENDPOINTOUTPUT;
const GRAPHQL_API_KEY = process.env.API_OPENEDITOR_GRAPHQLAPIIDOUTPUT;
const MEDIACONVERT_ROLE = process.env.MEDIACONVERT_ROLE;
const REGION = process.env.REGION || process.env.AWS_REGION || 'us-east-1';

const transcriptQuery = /* GraphQL */ `
  query transcriptQuery($uuid: ID!) {
    getTranscript(id: $uuid) {
      _deleted
      _lastChangedAt
      _version
      createdAt
      id
      language
      media
      metadata
      owner
      parent
      status
      title
      updatedAt
    }
  }
`;

const transcriptMutation = /* GraphQL */ `
  mutation transcriptMutation($input: UpdateTranscriptInput!) {
    updateTranscript(input: $input) {
      _deleted
      _lastChangedAt
      _version
      createdAt
      id
      language
      media
      metadata
      owner
      parent
      status
      title
      updatedAt
    }
  }
`;

// https://docs.amplify.aws/lib/graphqlapi/graphql-from-nodejs/q/platform/js/#iam-authorization
const graphqlRequest = async ({ query, variables }) => {
  const endpoint = new URL(GRAPHQL_ENDPOINT);

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: REGION,
    service: 'appsync',
    sha256: Sha256,
  });

  const requestToBeSigned = new HttpRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host: endpoint.host,
    },
    hostname: endpoint.host,
    body: JSON.stringify({ query, variables }),
    path: endpoint.pathname,
  });

  const signed = await signer.sign(requestToBeSigned);
  const request = new Request(endpoint, signed);

  let statusCode = 200;
  let body;
  let response;

  try {
    response = await fetch(request);
    body = await response.json();
    if (body.errors) statusCode = 400;
  } catch (error) {
    statusCode = 500;
    body = {
      errors: [
        {
          message: error.message,
        },
      ],
    };
  }

  // return {
  //   statusCode,
  //   body: JSON.stringify(body),
  // };
  return body;
};

export const handler = async function (event) {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));

  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  // UPLOAD
  if (key.startsWith('public/uploads/')) {
    const [, uuid] = key.split('/').reverse();

    const {
      data: { getTranscript: transcript },
    } = await graphqlRequest({ query: transcriptQuery, variables: { uuid } });

    const status = JSON.parse(transcript.status);

    // UPLOAD status
    const uploadIndex = status.steps.findIndex(step => step.type === 'upload');
    if (!status.steps[uploadIndex].data) status.steps[uploadIndex].data = {};
    status.steps[uploadIndex].data.s3 = event.Records[0].s3.object;

    // TRANSCODE
    const transcodeIndex = status.steps.findIndex(step => step.type === 'transcode');
    if (!status.steps[transcodeIndex].data) status.steps[transcodeIndex].data = {};
    // TODO skip if transcode not next?
    status.step = transcodeIndex;
    status.steps[transcodeIndex].status = 'wait';
    try {
      let mediaConvertClient = new MediaConvertClient({ region: REGION });
      const describeEndpointsCommand = new DescribeEndpointsCommand({ Mode: 'DEFAULT' });
      const describeEndpointsCommandOutput = await mediaConvertClient.send(describeEndpointsCommand);
      mediaConvertClient = new MediaConvertClient({
        endpoint: describeEndpointsCommandOutput.Endpoints[0].Url,
        region: REGION,
      });
      const createJobCommand = new CreateJobCommand({
        Role: MEDIACONVERT_ROLE,
        Settings: {
          OutputGroups: [
            {
              Name: 'File Group',
              Outputs: [
                {
                  ContainerSettings: {
                    Container: 'MP4',
                    Mp4Settings: {
                      CslgAtom: 'INCLUDE',
                      FreeSpaceBox: 'EXCLUDE',
                      MoovPlacement: 'PROGRESSIVE_DOWNLOAD',
                    },
                  },
                  AudioDescriptions: [
                    {
                      AudioTypeControl: 'FOLLOW_INPUT',
                      AudioSourceName: 'Audio Selector 1',
                      CodecSettings: {
                        Codec: 'AAC',
                        AacSettings: {
                          AudioDescriptionBroadcasterMix: 'NORMAL',
                          Bitrate: 96000,
                          RateControlMode: 'CBR',
                          CodecProfile: 'LC',
                          CodingMode: 'CODING_MODE_2_0',
                          RawFormat: 'NONE',
                          SampleRate: 48000,
                          Specification: 'MPEG4',
                        },
                      },
                      LanguageCodeControl: 'FOLLOW_INPUT',
                    },
                  ],
                  Extension: 'm4a',
                  NameModifier: '-transcoded',
                },
              ],
              OutputGroupSettings: {
                Type: 'FILE_GROUP_SETTINGS',
                FileGroupSettings: {
                  Destination: `s3://${bucket}/public/media/audio/${uuid}/`,
                },
              },
            },
          ],
          AdAvailOffset: 0,
          Inputs: [
            {
              AudioSelectors: {
                'Audio Selector 1': {
                  Offset: 0,
                  DefaultSelection: 'DEFAULT',
                  ProgramSelection: 1,
                },
              },
              FilterEnable: 'AUTO',
              PsiControl: 'USE_PSI',
              FilterStrength: 0,
              DeblockFilter: 'DISABLED',
              DenoiseFilter: 'DISABLED',
              TimecodeSource: 'EMBEDDED',
              FileInput: `s3://${bucket}/${key}`,
            },
          ],
        },
      });
      const createJobCommandOutput = await mediaConvertClient.send(createJobCommand);
      console.log(createJobCommandOutput);
      //
      // const getJobCommand = new GetJobCommand({ Id: createJobCommandOutput.Job.Id });
      // const getJobCommandOutput = await mediaConvertClient.send(getJobCommand);
      // console.log(getJobCommandOutput);
      //

      // TRANSCODE status
      status.steps[transcodeIndex].status = 'process';
      status.steps[transcodeIndex].data.job = createJobCommandOutput.Job;
    } catch (error) {
      console.log(error);
      // TRANSCODE error status
      status.steps[transcodeIndex].status = 'error';
      status.steps[transcodeIndex].data.error = error.message;
    }

    // UPDATE status
    const mutation = await graphqlRequest({
      query: transcriptMutation,
      variables: {
        input: {
          id: uuid,
          status: JSON.stringify(status),
          _version: transcript._version,
        },
      },
    });
  } else if (key.startsWith('public/media/audio/') && key.endsWith('.m4a')) {
    const [, uuid] = key.split('/').reverse();

    const {
      data: { getTranscript: transcript },
    } = await graphqlRequest({ query: transcriptQuery, variables: { uuid } });

    const status = JSON.parse(transcript.status);
    const media = JSON.parse(transcript.media);

    // TRANSCODE status
    const transcodeIndex = status.steps.findIndex(step => step.type === 'transcode');
    if (!status.steps[transcodeIndex].data) status.steps[transcodeIndex].data = {};
    status.steps[transcodeIndex].status = 'finish';
    status.steps[transcodeIndex].data.audio = { key };

    // Media
    media.audio = { key };

    // TRANSCRIBE
    const transcribeIndex = status.steps.findIndex(step => step.type === 'transcribe');
    if (!status.steps[transcribeIndex].data) status.steps[transcribeIndex].data = {};
    // TODO skip if transcode not next?
    status.step = transcribeIndex;
    status.steps[transcribeIndex].status = 'wait';
    try {
      const extension = 'm4a'; // FIXME derive from key?

      const transcribeClient = new TranscribeClient({ region: REGION });
      const startTranscriptionJobCommand = new StartTranscriptionJobCommand({
        LanguageCode: transcript.language ?? 'en-US',
        Media: {
          MediaFileUri: `s3://${bucket}/${key}`,
        },
        MediaFormat: extension === 'm4a' ? 'mp4' : extension,
        TranscriptionJobName: uuid,
        OutputBucketName: bucket,
        OutputKey: `public/transcript/${uuid}/stt.json`,
        Settings: {
          ShowSpeakerLabels: true,
          MaxSpeakerLabels: 10, // TODO this should be a parameter
        },
      });
      const startTranscriptionJobCommandOutput = await transcribeClient.send(startTranscriptionJobCommand);
      console.log(startTranscriptionJobCommandOutput);
      // TRANSCRIBE status
      status.steps[transcribeIndex].status = 'process';
      status.steps[transcribeIndex].data.job = startTranscriptionJobCommandOutput.TranscriptionJob;
    } catch (error) {
      // TRANSCRIBE error status
      status.steps[transcribeIndex].status = 'error';
      status.steps[transcribeIndex].data.error = error.message;
    }

    // UPDATE status
    const mutation = await graphqlRequest({
      query: transcriptMutation,
      variables: {
        input: {
          id: uuid,
          status: JSON.stringify(status),
          media: JSON.stringify(media),
          _version: transcript._version,
        },
      },
    });
  } else if (key.startsWith('public/transcript/') && key.endsWith('stt.json')) {
    const [, uuid] = key.split('/').reverse();

    const {
      data: { getTranscript: transcript },
    } = await graphqlRequest({ query: transcriptQuery, variables: { uuid } });

    const status = JSON.parse(transcript.status);

    // TRANSCRIBE status
    const transcribeIndex = status.steps.findIndex(step => step.type === 'transcribe');
    if (!status.steps[transcribeIndex].data) status.steps[transcribeIndex].data = {};
    status.steps[transcribeIndex].status = 'finish';
    status.steps[transcribeIndex].data.stt = { key };

    // EDIT status
    const editIndex = status.steps.findIndex(step => step.type === 'edit');
    if (!status.steps[editIndex].data) status.steps[editIndex].data = {};
    status.step = editIndex;
    status.steps[editIndex].status = 'wait';
    // TODO catch edits and set status to process?

    // UPDATE status
    const mutation = await graphqlRequest({
      query: transcriptMutation,
      variables: {
        input: {
          id: uuid,
          status: JSON.stringify(status),
          _version: transcript._version,
        },
      },
    });
  }
};

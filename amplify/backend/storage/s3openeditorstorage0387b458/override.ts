/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AmplifyS3ResourceTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyS3ResourceTemplate) {
  resources.s3Bucket.versioningConfiguration = {
    status: 'Enabled',
  };
}

/* eslint-disable prefer-destructuring */
/* eslint-disable dot-notation */
/* eslint-disable no-new */
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import * as iam from '@aws-cdk/aws-iam';
// import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';

export class cdkStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps,
    amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps,
  ) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, 'env', {
      type: 'String',
      description: 'Current Amplify CLI env name',
    });
    /* AWS CDK code goes here - learn more: https://docs.aws.amazon.com/cdk/latest/guide/home.html */

    const amplifyProjectInfo = AmplifyHelpers.getProjectInfo();

    const dependencies: AmplifyDependentResourcesAttributes = AmplifyHelpers.addResourceDependency(
      this,
      amplifyResourceProps.category,
      amplifyResourceProps.resourceName,
      [{ category: 'storage', resourceName: 's3openeditorstorage0387b458' }],
    );

    const bucketName = cdk.Fn.ref(dependencies.storage['s3openeditorstorage0387b458'].BucketName);

    const roleResourceNamePrefix = `mediaConvertRole-${amplifyProjectInfo.projectName}`;

    const role = new iam.Role(this, 'mediaConvertRole', {
      assumedBy: new iam.AccountRootPrincipal(),
      roleName: `${roleResourceNamePrefix}-${cdk.Fn.ref('env')}`,
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:*'],
        resources: [`arn:aws:s3:::${bucketName}`, `arn:aws:s3:::${bucketName}/*`],
      }),
    );

    // role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonAPIGatewayInvokeFullAccess'));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSElementalMediaConvertFullAccess'));
  }
}

/* eslint-disable prefer-destructuring */
/* eslint-disable dot-notation */
/* eslint-disable no-new */
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import * as iam from '@aws-cdk/aws-iam';
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
      [{ category: 'storage', resourceName: 's3storage' }],
    );

    const bucketName = cdk.Fn.ref(dependencies.storage['s3storage'].BucketName);

    const roleResourceNamePrefix = `MediaConvertRole-${amplifyProjectInfo.projectName}`;

    const role = new iam.Role(this, 'MediaConvertRole', {
      assumedBy: new iam.AccountRootPrincipal(),
      roleName: `${roleResourceNamePrefix}-${cdk.Fn.ref('env')}`,
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:*'],
        resources: [`arn:aws:s3:::${bucketName}`, `arn:aws:s3:::${bucketName}/*`],
      }),
    );

    role.assumeRolePolicy?.addStatements(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('mediaconvert.amazonaws.com')],
      }),
    );

    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonAPIGatewayInvokeFullAccess'));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSElementalMediaConvertFullAccess'));
  }
}

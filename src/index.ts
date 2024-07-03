import * as CDK from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StateMachine } from './stateMachine';
import * as Lambda from "aws-cdk-lib/aws-lambda";

export class SagaStack extends CDK.Stack {
  constructor(scope: Construct, id: string, props?: CDK.StackProps) {
    super(scope, id, props);

    // Layers
    const awsSdkLayer = new Lambda.LayerVersion(this, 'AWSdkLayer', {
      code: Lambda.Code.fromAsset('src/layers/aws-sdk'),
      compatibleRuntimes: [Lambda.Runtime.NODEJS_20_X],
      description: 'A layer for aws-sdk library',
    });

    const uuidLayer = new Lambda.LayerVersion(this, 'UuidLayer', {
      code: Lambda.Code.fromAsset('src/layers/uuid'),
      compatibleRuntimes: [Lambda.Runtime.NODEJS_20_X],
      description: 'A layer for uuid library',
    });


    const layers = [
      awsSdkLayer,
      uuidLayer
    ];

    // instantiate State Machine
    console.log('New StateMachine');
    new StateMachine(this, 'StateMachine', layers);
  }
}

const app = new CDK.App();
console.log('New SagaStack');
new SagaStack(app, 'SagaStack-Demo', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
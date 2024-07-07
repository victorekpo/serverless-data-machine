import { Template } from 'aws-cdk-lib/assertions';
import * as CDK from 'aws-cdk-lib';
import { SagaStack } from './index';

let template: Template;

describe('CDK Stack', () => {
  beforeAll(() => {
    const app = new CDK.App();
    const stack = new SagaStack(app, 'MyTestStack');
    template = Template.fromStack(stack);
    console.log('Template', JSON.stringify(template, null, 2));
  });

  test('API Gateway Proxy Created', () => {
    console.log('Testing API Gateway');
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      'PathPart': 'start', // use proxy for catch all '{proxy+}'
    });
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      'PathPart': 'approve',
    });
  });

  test('11 Lambda Functions Created', () => {
    console.log('Testing Lambda Functions');
    template.resourceCountIs('AWS::Lambda::Function', 11);
  });


});

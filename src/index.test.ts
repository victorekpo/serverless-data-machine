import { Template } from 'aws-cdk-lib/assertions';
import * as CDK from 'aws-cdk-lib';
import { SagaStackAPI, SagaStackStateMachine } from './index';

let templateAPI: Template;
let templateSM: Template;

describe('CDK Stack', () => {
  beforeAll(() => {
    const app = new CDK.App();
    const stackAPI = new SagaStackAPI(app, 'MyTestStack-API');
    const stackSM = new SagaStackStateMachine(app, 'MyTestStack-SM');
    templateAPI = Template.fromStack(stackAPI);
    templateSM = Template.fromStack(stackSM);
    console.log('Template', JSON.stringify(templateAPI, null, 2));
    console.log('Template', JSON.stringify(templateSM, null, 2));
  });

  test('API Gateway Proxy Created', () => {
    console.log('Testing API Gateway');
    templateSM.hasResourceProperties('AWS::ApiGateway::Resource', {
      'PathPart': 'start', // use proxy for catch all '{proxy+}'
    });
    templateSM.hasResourceProperties('AWS::ApiGateway::Resource', {
      'PathPart': 'approve',
    });
  });

  test('11 Lambda Functions Created', () => {
    console.log('Testing Lambda Functions');
    templateSM.resourceCountIs('AWS::Lambda::Function', 11);
  });
});

import { Template } from "aws-cdk-lib/assertions";
import * as CDK from "aws-cdk-lib";
import { CdkServerlessSagaStack } from "./index";

let template: Template;

describe("CDK Stack", () => {
  beforeAll(() => {
    const app = new CDK.App();
    const stack = new CdkServerlessSagaStack(app, "MyTestStack");
    template = Template.fromStack(stack);
    console.log("Template", template);
  });

  test("API Gateway Proxy Created", () => {
    console.log("Testing API Gateway");
    template.hasResourceProperties("AWS::ApiGateway::Resource", {
      "PathPart": "{proxy+}"
    });
  });

  test("9 Lambda Functions Created", () => {
    console.log("Testing Lambda Functions");
    template.resourceCountIs("AWS::Lambda::Function", 9);
  });


})

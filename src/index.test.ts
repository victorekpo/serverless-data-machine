import { Template } from "aws-cdk-lib/assertions";
import * as CDK from "aws-cdk-lib";
import { CdkServerlessSagaStack } from "./index";

let template: Template;

describe("CDK Stack", () => {
  beforeAll(() => {
    console.log("Before Test")
    const app = new CDK.App();
    console.log("New App", app);
    const stack = new CdkServerlessSagaStack(app, "MyTestStack");
    console.log("New Stack", stack);
    template = Template.fromStack(stack);
    console.log("Template", template);
  });

  test("API Gateway Proxy Created", () => {
    console.log("Testing API Gateway")
    template.hasResourceProperties("AWS::ApiGateway::Resource", {
      "PathPart": "{proxy+}"
    });
  });

  test("9 Lambda Functions Created", () => {
    template.resourceCountIs("AWS::Lambda::Function", 9);
  });
})

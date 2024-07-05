import { Construct } from "constructs";
import * as Apigw from 'aws-cdk-lib/aws-apigateway';
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from 'aws-cdk-lib/aws-lambda';

export const linkApi = (scope: Construct, api: RestApi, handler: IFunction) => {
  // Create a new resource
  const resource = api.root.addResource('your-resource');

  // For POST, PUT, DELETE Requests
  const requestModel = new Apigw.Model(scope, 'RequestModel', {
    restApi: api,
    schema: {
      type: Apigw.JsonSchemaType.OBJECT,
      properties: {
        name: { type: Apigw.JsonSchemaType.STRING },
        age: { type: Apigw.JsonSchemaType.NUMBER }
      },
      required: ['name']
    }
  });

  const responseModel = new Apigw.Model(scope, 'ResponseModel', {
    restApi: api,
    schema: {
      type: Apigw.JsonSchemaType.OBJECT,
      properties: {
        message: { type: Apigw.JsonSchemaType.STRING },
        status: { type: Apigw.JsonSchemaType.STRING }
      }
    }
  });


// Add a GET method to the resource with lambda integration to the handler function
  resource.addMethod('GET', new Apigw.LambdaIntegration(handler), {
    methodResponses: [{
      statusCode: '200',
      responseModels: {
        'application/json': responseModel
      }
    }]
  });
}
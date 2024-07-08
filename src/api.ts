import { Construct } from "constructs";
import * as Apigw from 'aws-cdk-lib/aws-apigateway';
import { IRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from 'aws-cdk-lib/aws-lambda';

export const createApiModels = (scope: Construct, api: IRestApi) => {
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

  return {
    requestModel,
    responseModel
  };
};

export const linkSagaApi = (scope: Construct, api: IRestApi, handler: IFunction, responseModel: any) => {
  // Create a new resource (API path)
  const resource = api.root.addResource('start');

  // Add a GET method to the resource with lambda integration to the handler function
  resource.addMethod('GET', new Apigw.LambdaIntegration(handler), {
    methodResponses: [{
      statusCode: '200',
      responseModels: {
        'application/json': responseModel
      }
    }]
  });
};

export const linkApprovalApi = (scope: Construct, api: IRestApi, handler: IFunction, responseModel: any) => {
  const resource = api.root.addResource('approve');

  // Add a GET method to the resource with lambda integration to the handler function
  resource.addMethod('GET', new Apigw.LambdaIntegration(handler), {
    methodResponses: [{
      statusCode: '200',
      responseModels: {
        'application/json': responseModel
      }
    }]
  });
};
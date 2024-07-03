import { StepFunctions } from 'aws-sdk';
import { validateInputs } from '../utils/validateInputs';
import { v4 } from 'uuid';

export interface SagaLambdaEvent {
  queryStringParameters: {
    departCity?: string;
    departTime?: string;
    arriveCity?: string;
    arriveTime?: string;
    rental?: string;
    rentalFrom?: string;
    rentalTo?: string;
    requestId?: string;
    runType?: string;
  }
}

const stepFunctions = new StepFunctions({});

export const handler = (event: SagaLambdaEvent, context: any, callback: any) => {
  const { queryStringParameters } = event;

  const runType = queryStringParameters?.runType || 'success';
  const requestId = queryStringParameters?.requestId || context.awsRequestId || v4();

  if (!queryStringParameters) {
    throw new Error('No input parameters found');
  }

  const inputs = validateInputs(queryStringParameters, requestId, runType);

  const params = {
    stateMachineArn: <string>process.env.statemachine_arn,
    input: JSON.stringify(inputs)
  };

  stepFunctions.startExecution(params, (err: any, data: any) => {
    if (err) {
      console.log(err);
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: 'There was an error processing your reservation'
        })
      };
      callback(null, response);
    } else {
      console.log(data);
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Your reservation is being processed'
        })
      };
      callback(null, response);
    }
  });
};
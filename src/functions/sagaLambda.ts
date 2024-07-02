import { StepFunctions } from "aws-sdk";

const stepFunctions = new StepFunctions({});

export const handler = (event: any, context: any, callback: any) => {
  let runType = "success";
  let tripID = context.awsRequestId;

  if (null != event.queryStringParameters) {
    if (typeof event.queryStringParameters.runType != 'undefined') {
      runType = event.queryStringParameters.runType;
    }

    if (typeof event.queryStringParameters.tripID != 'undefined') {
      tripID = event.queryStringParameters.tripID;
    }
  }

  const input = {
    "trip_id": tripID,
    "depart_city": "Milwaukee",
    "depart_time": "2024-01-01T00:00:00.000Z",
    "arrive_city": "Abuja",
    "arrive_time": "2024-01-03T00:00:00.000Z",
    "rental": "BMW X7",
    "rental_from": "2024-01-03T00:00:00.000Z",
    "rental_to": "2024-01-10T00:00:00.000Z",
    "run_type": runType
  };

  const params = {
    stateMachineArn: <string>process.env.statemachine_arn,
    input: JSON.stringify(input)
  };

  stepFunctions.startExecution(params, (err: any, data: any) => {
    if (err) {
      console.log(err);
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: "There was an error processing your reservation"
        })
      };
      callback(null, response);
    } else {
      console.log(data);
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: "Your reservation is being processed"
        })
      };
      callback(null, response);
    }
  });
};
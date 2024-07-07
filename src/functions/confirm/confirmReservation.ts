import { StepFunctions } from 'aws-sdk';
const Sfn = new StepFunctions();

exports.handler = async (event: any) => {
  console.log("EVENT", JSON.stringify(event, null, 2));
  const taskToken = event.queryStringParameters.taskToken;

  const params = {
    taskToken: taskToken,
    output: JSON.stringify({ status: 'approved' })
  };

  try {
    await Sfn.sendTaskSuccess(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Task approved successfully' })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to approve task', error: error.message })
    };
  }
};

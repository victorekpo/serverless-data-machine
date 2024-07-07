import { SNS } from 'aws-sdk';

exports.handler = async (event: any) => {
  console.log("EVENT", event);
  console.log("ENV", process.env);

  const taskToken = event.taskToken;

  const approvalUrl = `${process.env.API_URL}/approve?taskToken=${taskToken}`;
  const encodedApprovalUrl = encodeURIComponent(approvalUrl);

  const message = {
    Subject: 'Approval Request',
    Message: `Please approve the task by clicking the following link: ${encodedApprovalUrl}`,
    TopicArn: process.env.TOPIC_ARN
  };

  const sns = new SNS();

  try {
    await sns.publish(message).promise();
    console.log('Approval email sent successfully');
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
};

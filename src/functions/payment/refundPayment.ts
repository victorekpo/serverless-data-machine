import { DynamoDB } from 'aws-sdk';
import { DeleteItemInput } from "aws-sdk/clients/dynamodb";

interface RefundPaymentEvent {
  ProcessPaymentResult: {
    Payload: {
      paymentId: string;
    }
  };
  requestId: string;
}

export const handler = async (event: RefundPaymentEvent) => {
  const { requestId, ProcessPaymentResult } = event;

  console.log(`Refunding payment: ${JSON.stringify(event, null, 2)}`);

  if (!ProcessPaymentResult) {
    throw new Error(`No result found for processing payment!; Payment: ${JSON.stringify(ProcessPaymentResult)}`);
  }

  const { paymentId } = ProcessPaymentResult.Payload;

  const dynamoDB = new DynamoDB();

  const params: DeleteItemInput = {
    TableName: process.env.TABLE_NAME || 'Payments',
    Key: {
      'pk': { S: requestId },
      'sk': { S: paymentId }
    }
  };

  const result = await dynamoDB
    .deleteItem(params)
    .promise()
    .catch(error => {
      throw new Error(error);
    });

  console.log(`Payment refunded successfully: ${JSON.stringify(result)}`);

  return {
    status: 'ok'
  };
};
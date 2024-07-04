import { DynamoDB } from 'aws-sdk';
import { v4 } from "uuid";
import { PutItemInput } from "aws-sdk/clients/dynamodb";
interface ProcessPaymentEvent {
  ReserveFlightResult: {
    Payload: {
      flightReservationId: string;
    }
  };
  ReserveCarRentalResult: {
    Payload: {
      carReservationId: string;
    }
  };
  requestId: string;
  runType?: string;
}

export const handler = async (event: ProcessPaymentEvent) => {
  const { requestId, runType, ReserveFlightResult, ReserveCarRentalResult } = event;

  console.log(`Processing payment: ${JSON.stringify(event, null, 2)}`);

  if (runType === 'failPayment') {
    throw new Error('Failed to process payment');
  }

  if (!ReserveFlightResult || !ReserveCarRentalResult) {
    throw new Error(`No result found for processing payment!; Flight: ${JSON.stringify(ReserveFlightResult)}; Rental: ${JSON.stringify(ReserveCarRentalResult)}`);
  }

  const { flightReservationId } = ReserveFlightResult.Payload;
  const { carReservationId } = ReserveCarRentalResult.Payload;

  const paymentId = v4();

  const dynamoDB = new DynamoDB();

  const params: PutItemInput = {
    TableName: process.env.TABLE_NAME || 'Payments',
    Item: {
      'pk': { S: requestId },
      'sk': { S: paymentId },
      'trip_id': { S: requestId },
      'id': { S: paymentId },
      'amount': { S: "750.00" },
      'currency': { S: 'USD' },
      'transaction_status': { S: 'confirmed' }
    }
  };

  const result = await dynamoDB
    .putItem(params)
    .promise()
    .catch(error => {
      throw new Error(error);
    });

  console.log(`Payment processed successfully: ${JSON.stringify(result)}`);

  return {
    status: 'ok',
    paymentId
  };
};
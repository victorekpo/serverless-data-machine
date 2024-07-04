import { DynamoDB } from 'aws-sdk';
import { DeleteItemInput } from 'aws-sdk/clients/dynamodb';

interface CancelRentalEvent {
  ReserveCarRentalResult: {
    Payload: {
      carRentalReservationId: string;
    }
  }
  requestId: string;
}

export const handler = async (event: CancelRentalEvent) => {
  const { requestId, ReserveCarRentalResult } = event;

  console.log(`Canceling rental: ${JSON.stringify(event, null, 2)}`, process.env.TABLE_NAME);

  if (!ReserveCarRentalResult) {
    throw new Error('No Result received for canceling rental');
  }

  const { carRentalReservationId } = ReserveCarRentalResult.Payload;

  const dynamoDB = new DynamoDB();

  console.log(`Getting ready to delete item in dynamodb, carRental: ${carRentalReservationId}; requestId: ${requestId}`);
  const params: DeleteItemInput = {
    TableName: <string>process.env.TABLE_NAME || 'Rentals',
    Key: {
      'pk': { S: requestId },
      'sk': { S: carRentalReservationId }
    }
  };
  console.log("Params used", params);

  const result = await dynamoDB
    .deleteItem(params)
    .promise()
    .catch(error => {
      throw new Error(error);
    });

  console.log(`Deleted car rental reservation: ${carRentalReservationId}; result: ${JSON.stringify(result)}`);

  return {
    status: 'ok'
  };
};
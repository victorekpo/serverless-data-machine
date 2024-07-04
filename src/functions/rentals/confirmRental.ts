import { DynamoDB } from 'aws-sdk';
import { UpdateItemInput } from 'aws-sdk/clients/dynamodb';

interface ConfirmRentalEvent {
  ReserveCarRentalResult: {
    Payload: {
      carRentalReservationId: string;
    }
  }
  requestId: string;
  runType: string;
}

export const handler = async (event: ConfirmRentalEvent) => {
  const { requestId, runType, ReserveCarRentalResult} = event;

  console.log(`Confirming car rental: ${JSON.stringify(event, null, 2)}`, process.env.TABLE_NAME);

  if (runType === 'failCarRentalConfirmation') {
    throw new Error('Failed to book the car rental');
  }

  if (!ReserveCarRentalResult) {
    throw new Error('No result found for confirming rental');
  }

  const { carRentalReservationId } = ReserveCarRentalResult.Payload;

  const dynamoDB = new DynamoDB();

  console.log(`Getting ready to update item in dynamodb, carRental: ${carRentalReservationId}; requestId: ${requestId}`);
  const params: UpdateItemInput = {
    TableName: <string>process.env.TABLE_NAME || 'Rentals',
    Key: {
      'pk': { S: requestId },
      'sk': { S: carRentalReservationId }
    },
    UpdateExpression: 'set transaction_status = :booked',
    ExpressionAttributeValues: {
      ':booked': { S: 'confirmed' }
    }
  };
  console.log("Params used", params);

  // Call DynamoDB to add the item to the table
  const result = await dynamoDB
    .updateItem(params)
    .promise()
    .catch(error => {
      throw new Error(error);
    });

  console.log(`Confirmed car rental reservation: ${JSON.stringify(result)}`);

  return {
    status: 'ok',
    carRentalReservationId
  };
};
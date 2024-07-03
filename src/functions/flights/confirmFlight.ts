import { DynamoDB } from 'aws-sdk';
import { UpdateItemInput } from 'aws-sdk/clients/dynamodb';

interface ConfirmFlightEvent {
  runType: string;
  ReserveFlightResult: {
    Payload: {
      flightReservationId: string;
    }
  }
  requestId: string;
}

export const handler = async (event: ConfirmFlightEvent) => {
  const { requestId, runType, ReserveFlightResult} = event;

  console.log(`Confirming flights: ${JSON.stringify(event, null, 2)}`);

  if (runType !== 'failFlightsConfirmation') {
    throw new Error('Failed to book the flights');
  }

  if (!ReserveFlightResult) {
    throw new Error('No result found for confirming flight');
  }

  const { flightReservationId } = ReserveFlightResult.Payload;

  const dynamoDB = new DynamoDB();

  console.log(`Getting ready to update item in dynamodb, tripId: ${flightReservationId}; requestId: ${requestId}`);
  const params: UpdateItemInput = {
    TableName: <string>process.env.TABLE_NAME,
    Key: {
      'pk': { S: requestId },
      'sk': { S: flightReservationId }
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

  console.log(`Confirmed flight reservation: ${JSON.stringify(result)}`);

  return {
    status: 'ok',
    flightReservationId
  };
};
import { DynamoDB } from 'aws-sdk';
import { DeleteItemInput } from 'aws-sdk/clients/dynamodb';

interface CancelFlightEvent {
  ReserveFlightResult: {
    Payload: {
      flightReservationId: string;
    }
  }
  requestId: string;
}

export const handler = async (event: CancelFlightEvent) => {
  const { requestId, ReserveFlightResult } = event;

  console.log(`Canceling flights: ${JSON.stringify(event, null, 2)}`, process.env.TABLE_NAME);

  if (!ReserveFlightResult) {
    throw new Error('No Result received for canceling flights');
  }

  const { flightReservationId } = ReserveFlightResult.Payload;

  const dynamoDB = new DynamoDB();

  console.log(`Getting ready to delete item in dynamodb, flightReservation: ${flightReservationId}; requestId: ${requestId}`);
  const params: DeleteItemInput = {
    TableName: <string>process.env.TABLE_NAME || 'Flights',
    Key: {
      'pk': { S: requestId },
      'sk': { S: flightReservationId }
    }
  };
  console.log("Params used", params);

  const result = await dynamoDB
    .deleteItem(params)
    .promise()
    .catch(error => {
      throw new Error(error);
    });

  console.log(`Deleted flight reservation: ${flightReservationId}; result: ${JSON.stringify(result)}`);

  return {
    status: 'ok'
  };
};
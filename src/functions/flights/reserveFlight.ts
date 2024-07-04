import { v4 } from 'uuid';
import { DynamoDB } from 'aws-sdk';
import { PutItemInput } from 'aws-sdk/clients/dynamodb';

interface ReserveRentalEvent {
  departCity: string;
  departTime: string;
  arriveCity: string;
  arriveTime: string;
  requestId: string;
  runType: string;
}

export const handler = async (event: ReserveRentalEvent) => {
  const { requestId, runType, departCity, departTime, arriveCity, arriveTime } = event;

  console.log(`Reserving rentals request: ${JSON.stringify(event, null, 2)}`, process.env.TABLE_NAME);

  if (runType === 'failFlightsReservation') {
    throw new Error('Failed to book the flights');
  }

  const flightReservationId = v4();
  console.log(`flightReservationId: ${flightReservationId}`);

  // create AWS SDK clients
  const dynamoDB = new DynamoDB();

  console.log(`Getting ready to insert item in dynamodb, flightReservation: ${flightReservationId}; requestId: ${requestId}`);
  const params: PutItemInput = {
    TableName: <string>process.env.TABLE_NAME || 'Flights',
    Item: {
      'pk': { S: requestId },
      'sk' : { S: flightReservationId },
      'trip_id': { S: requestId },
      'id': { S: flightReservationId },
      'depart_city': { S: departCity },
      'depart_time': { S: departTime },
      'arrive_city': { S: arriveCity },
      'arrive_time': { S: arriveTime },
      'transaction_status': { S: 'pending' }
    }
  };
  console.log("Params used", params);
  const result = await dynamoDB
    .putItem(params)
    .promise()
    .catch(error => {
      console.error('Error occurred while inserting into dynamoDB', error);
      throw new Error(error);
    });

  console.log(`Reserve flight result: ${JSON.stringify(result)}`);

  return {
    status: 'ok',
    flightReservationId
  };
};
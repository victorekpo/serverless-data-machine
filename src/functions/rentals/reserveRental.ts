import { v4 } from 'uuid';
import { DynamoDB } from 'aws-sdk';
import { PutItemInput } from 'aws-sdk/clients/dynamodb';

interface ReserveRentalEvent {
  rental: string;
  rentalFrom: string;
  rentalTo: string;
  requestId: string;
  runType: string;
}

export const handler = async (event: ReserveRentalEvent) => {
  const { requestId, runType, rental, rentalFrom, rentalTo } = event;

  console.log(`Reserving rentals request: ${JSON.stringify(event, null, 2)}`, process.env.TABLE_NAME);

  if (runType === 'failCarRentalReservation') {
    throw new Error('Failed to book the car rental');
  }

  const carRentalReservationId = v4();
  console.log(`carReservationId: ${carRentalReservationId}`);

  // create AWS SDK clients
  const dynamoDB = new DynamoDB();

  console.log(`Getting ready to insert item in dynamodb, carReservation: ${carRentalReservationId}; requestId: ${requestId}`);
  const params: PutItemInput = {
    TableName: <string>process.env.TABLE_NAME || 'Rentals',
    Item: {
      'pk': { S: requestId },
      'sk' : { S: carRentalReservationId },
      'trip_id': { S: requestId },
      'id': { S: carRentalReservationId },
      'rental': { S: rental },
      'rental_from': { S: rentalFrom },
      'rental_to': { S: rentalTo },
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

  console.log(`Reserve rental result: ${JSON.stringify(result)}`);

  return {
    status: 'ok',
    carRentalReservationId
  };
};
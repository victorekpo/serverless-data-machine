import { Construct } from 'constructs';
import * as Dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';

export const createDynamoDBTables = (scope: Construct) => {
  /**
   * Create Dynamo DB tables which holds flights and car rentals reservations as well as payments information
   */
  const flightTable = new Dynamodb.Table(scope, 'Flights', {
    partitionKey: {
      name: 'pk',
      type: Dynamodb.AttributeType.STRING
    },
    sortKey: {
      name: 'sk',
      type: Dynamodb.AttributeType.STRING
    },
    removalPolicy: RemovalPolicy.DESTROY
  });


  const rentalTable = new Dynamodb.Table(scope, 'Rentals', {
    partitionKey: {
      name: 'pk',
      type: Dynamodb.AttributeType.STRING
    },
    sortKey: {
      name: 'sk',
      type: Dynamodb.AttributeType.STRING
    },
    removalPolicy: RemovalPolicy.DESTROY
  });

  const paymentTable = new Dynamodb.Table(scope, 'Payments', {
    partitionKey: {
      name: 'pk',
      type: Dynamodb.AttributeType.STRING
    },
    sortKey: {
      name: 'sk',
      type: Dynamodb.AttributeType.STRING
    },
    removalPolicy: RemovalPolicy.DESTROY
  });

  return {
    flightTable,
    rentalTable,
    paymentTable
  };
};
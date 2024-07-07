import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';

/**
 * Create Lambda Functions for booking and cancellation of services.
 */

export const createLambdaFunctions = (scope: Construct, createFn: any, tables: Record<string, Table>, topic: any, layers: LayerVersion[]) => {
  const { flightTable, rentalTable, paymentTable } = tables;

  const createFnWithLayers = (args: Record<string, any>) => {
    return createFn({...args, layers });
  };

  // Flights
  const reserveFlightLambda = createFnWithLayers({ scope, id: 'reserveFlightLambdaHandler', handler: 'flights/reserveFlight.ts', tables: [flightTable] });
  const confirmFlightLambda = createFnWithLayers({ scope, id: 'confirmFlightLambdaHandler', handler: 'flights/confirmFlight.ts', tables: [flightTable] });
  const cancelFlightLambda = createFnWithLayers({ scope, id: 'cancelFlightLambdaHandler', handler: 'flights/cancelFlight.ts', tables: [flightTable] });

  // Car Rentals
  const reserveRentalLambda = createFnWithLayers({ scope, id: 'reserveRentalLambdaHandler', handler: 'rentals/reserveRental.ts', tables: [rentalTable] });
  const confirmRentalLambda = createFnWithLayers({ scope, id: 'confirmRentalLambdaHandler', handler: 'rentals/confirmRental.ts', tables: [rentalTable] });
  const cancelRentalLambda = createFnWithLayers({ scope, id: 'cancelRentalLambdaHandler', handler: 'rentals/cancelRental.ts', tables: [rentalTable] });

  // Confirm Reservation
  const confirmReservationLambda = createFnWithLayers({ scope, id: 'confirmReservationLambdaHandler', handler: 'confirm/confirmReservation.ts', environment: { TOPIC_ARN: topic.arn} });
  // Grant the Lambda function permissions to publish to the SNS topic
  topic.grantPublish(confirmReservationLambda);

  // Payment
  const processPaymentLambda = createFnWithLayers({ scope, id: 'processPaymentLambdaHandler', handler: 'payment/processPayment.ts', tables: [paymentTable] });
  const refundPaymentLambda = createFnWithLayers({ scope, id: 'refundPaymentLambdaHandler', handler: 'payment/refundPayment.ts', tables: [paymentTable] });

  return {
    flightFns: {
      reserveFlightLambda,
      confirmFlightLambda,
      cancelFlightLambda
    },
    carRentalFns: {
      reserveRentalLambda,
      confirmRentalLambda,
      cancelRentalLambda
    },
    confirm: {
      confirmReservationLambda
    },
    paymentFns: {
      processPaymentLambda,
      refundPaymentLambda
    }
  };
};

/**
 * Utility method to create Lambda blueprint
 * @param scope
 * @param id
 * @param handler
 * @param table
 * @param layers
 */

export const createLambda = ({ scope, id, handler, environment, tables, layers }: {
  scope: Construct;
  id: string;
  handler: string;
  environment: Record<string, any>,
  tables: Table[] | null;
  layers?: LayerVersion[] | undefined;
}) => {
  console.log("CREATING ENV", environment);
  const fn = new NodejsFunction(scope, id, {
    runtime: Lambda.Runtime.NODEJS_20_X,
    entry: join('src', 'functions', handler),
    environment: {
      ...environment,
      TABLE_NAME: tables?.length ? tables[0]?.tableName : 'none'
    },
    ...(layers && { layers })
  });

  // Give Lambda permissions to read and write data from the DynamoDB table
  if (tables) {
    tables.forEach(table => {
      if (table) {
        table.grantReadWriteData(fn);
      }
    });
  }

  return fn;
};

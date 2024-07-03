import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';

/**
 * Create Lambda Functions for booking and cancellation of services.
 */

export const createLambdaFunctions = (scope: Construct, createFn: any, tables: Record<string, Table>, layers: LayerVersion[]) => {
  const { flightTable, rentalTable, paymentTable } = tables;

  const createFnWithLayers = (...args: any[]) => {
    return createFn(...args, layers);
  };

  // Flights
  const reserveFlightLambda = createFnWithLayers(scope, 'reserveFlightLambdaHandler', 'flights/reserveFlight.ts', flightTable);
  const confirmFlightLambda = createFnWithLayers(scope, 'confirmFlightLambdaHandler', 'flights/confirmFlight.ts', flightTable);
  const cancelFlightLambda = createFnWithLayers(scope, 'cancelFlightLambdaHandler', 'flights/cancelFlight.ts', flightTable);

  //Car Rentals
  const reserveRentalLambda = createFnWithLayers(scope, 'reserveRentalLambdaHandler', 'rentals/reserveRental.ts', rentalTable);
  const confirmRentalLambda = createFnWithLayers(scope, 'confirmRentalLambdaHandler', 'rentals/confirmRental.ts', rentalTable);
  const cancelRentalLambda = createFnWithLayers(scope, 'cancelRentalLambdaHandler', 'rentals/cancelRental.ts', rentalTable);

  // Payment
  const processPaymentLambda = createFnWithLayers(scope, 'processPaymentLambdaHandler', 'payment/processPayment.ts', paymentTable);
  const refundPaymentLambda = createFnWithLayers(scope, 'refundPaymentLambdaHandler', 'payment/refundPayment.ts', paymentTable);

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

export const createLambda = (scope: Construct, id: string, handler: string, table: Table, layers?: LayerVersion[] | undefined) => {
  console.log("TableLambda: ", table.tableName)
  const fn = new NodejsFunction(scope, id, {
    runtime: Lambda.Runtime.NODEJS_20_X,
    entry: join('src', 'functions', handler),
    bundling: {
      environment: {
        TABLE_NAME: table.tableName
      }
    },
    ...(layers && { layers })
  });

  // Give Lambda permissions to read and write data from the DynamoDB table
  table.grantReadWriteData(fn);

  return fn;
};
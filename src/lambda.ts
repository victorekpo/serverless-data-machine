import * as Lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { Table } from "aws-cdk-lib/aws-dynamodb";

/**
 * Create Lambda Functions for booking and cancellation of services.
 */

export const createLambdaFunctions = (scope: Construct, createFn: any, tables: Record<string, Table>) => {
  const { flightTable, rentalTable, paymentTable } = tables;

  // Flights
  const reserveFlightLambda = createFn(scope, "reserveFlightLambdaHandler", "flights/reserveFlight.ts", flightTable);
  const confirmFlightLambda = createFn(scope, "confirmFlightLambdaHandler", "flights/confirmFlight.ts", flightTable);
  const cancelFlightLambda = createFn(scope, "cancelFlightLambdaHandler", "flights/cancelFlight.ts", flightTable);

  //Car Rentals
  const reserveRentalLambda = createFn(scope, "reserveRentalLambdaHandler", "rentals/reserveRental.ts", rentalTable);
  const confirmRentalLambda = createFn(scope, "confirmRentalLambdaHandler", "rentals/confirmRental.ts", rentalTable);
  const cancelRentalLambda = createFn(scope, "cancelRentalLambdaHandler", "rentals/cancelRental.ts", rentalTable);

  // Payment
  const processPaymentLambda = createFn(scope, "processPaymentLambdaHandler", "payment/processPayment.ts", paymentTable);
  const refundPaymentLambda = createFn(scope, "refundPaymentLambdaHandler", "payment/refundPayment.ts", paymentTable);

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
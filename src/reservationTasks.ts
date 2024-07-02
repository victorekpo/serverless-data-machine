import { Construct } from "constructs";
import * as Tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { createLambdaFunctions } from "./lambda";
import { createLambda } from "./utils/constructLambdas";
import { createDynamoDBTables } from "./dynamodb";

export const createReservationTasks = (scope: Construct, notifications: any) => {
  const { reservationFailed, snsNotificationFailure } = notifications;

  // Create DynamoDB Tables
  const tables = createDynamoDBTables(scope);

  // Create Lambda Functions
  const {
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
  } = createLambdaFunctions(scope, createLambda, tables);

  /**
   * Reserve Flights
   */

  const cancelFlightReservation = new Tasks.LambdaInvoke(scope, "CancelFlightReservation", {
    lambdaFunction: cancelFlightLambda,
    resultPath: "$.CancelFlightReservationResult",
  })
    .addRetry({ maxAttempts: 3 })
    .next(snsNotificationFailure)
    .next(reservationFailed);

  const reserveFlight = new Tasks.LambdaInvoke(scope, "ReserveFlight", {
    lambdaFunction: reserveFlightLambda,
    resultPath: "$.ReserveFlightResult",
  })
    .addCatch(cancelFlightReservation, {
      resultPath: "$.ReserveFlightError"
    });

  /**
   * Reserve Car Rentals
   */

  const cancelRentalReservation = new Tasks.LambdaInvoke(scope, "CancelRentalReservation", {
    lambdaFunction: cancelRentalLambda,
    resultPath: "$.CancelRentalReservationResult"
  })
    .addRetry({ maxAttempts: 3 })
    .next(cancelFlightReservation);

  const reserveCarRental = new Tasks.LambdaInvoke(scope, "ReserveCarRental", {
    lambdaFunction: reserveRentalLambda,
    resultPath: "$.ReserveCarRentalResult"
  })
    .addCatch(cancelRentalReservation, {
      resultPath: "$.ReserveCarRentalError"
    });

  /**
   * Payment
   */

  const refundPayment = new Tasks.LambdaInvoke(scope, "RefundPayment", {
    lambdaFunction: refundPaymentLambda,
    resultPath: "$.RefundPaymentResult"
  })
    .addRetry({ maxAttempts: 3 })
    .next(cancelRentalReservation);

  const processPayment = new Tasks.LambdaInvoke(scope, "ProcessPayment", {
    lambdaFunction: processPaymentLambda,
    resultPath: "$.ProcessPaymentResult"
  })
    .addCatch(refundPayment, {
      resultPath: "$.ProcessPaymentError"
    });

  /**
   * Confirm Flight and Car Rental reservation
   */

  const confirmFlight = new Tasks.LambdaInvoke(scope, "ConfirmFlight", {
    lambdaFunction: confirmFlightLambda,
    resultPath: "$.ConfirmFlightResult"
  })
    .addCatch(refundPayment, {
      resultPath: "$.ConfirmFlightError"
    });

  const confirmCarRental = new Tasks.LambdaInvoke(scope, "ConfirmCarRental", {
    lambdaFunction: confirmRentalLambda,
    resultPath: "$.ConfirmCarRentalResult"
  })
    .addCatch(refundPayment, {
    resultPath: "$.ConfirmCarRentalError"
  });

  return {
    reserveFlight,
    reserveCarRental,
    processPayment,
    confirmFlight,
    confirmCarRental
  };
};

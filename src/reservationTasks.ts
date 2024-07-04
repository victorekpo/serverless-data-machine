import { Construct } from 'constructs';
import * as Sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as Tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { createLambda, createLambdaFunctions } from './lambda';
import { createDynamoDBTables } from './dynamodb';
import { LayerVersion } from "aws-cdk-lib/aws-lambda";

export const createReservationTasks = (scope: Construct, notifications: any, layers: LayerVersion[]) => {
  const { reservationFailed, snsNotificationFailure, topic } = notifications;

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
  } = createLambdaFunctions(scope, createLambda, tables, layers);

  /**
   * Reserve Flights
   */

  const cancelFlightReservation = new Tasks.LambdaInvoke(scope, 'CancelFlightReservation', {
    lambdaFunction: cancelFlightLambda,
    resultPath: '$.CancelFlightReservationResult',
  })
    .addRetry({ maxAttempts: 3 })
    .next(snsNotificationFailure)
    .next(reservationFailed);

  const reserveFlight = new Tasks.LambdaInvoke(scope, 'ReserveFlight', {
    lambdaFunction: reserveFlightLambda,
    resultPath: '$.ReserveFlightResult',
  })
    .addCatch(cancelFlightReservation, {
      resultPath: '$.ReserveFlightError'
    });

  /**
   * Reserve Car Rentals
   */

  const cancelRentalReservation = new Tasks.LambdaInvoke(scope, 'CancelRentalReservation', {
    lambdaFunction: cancelRentalLambda,
    resultPath: '$.CancelRentalReservationResult'
  })
    .addRetry({ maxAttempts: 3 })
    .next(cancelFlightReservation);

  const reserveCarRental = new Tasks.LambdaInvoke(scope, 'ReserveCarRental', {
    lambdaFunction: reserveRentalLambda,
    resultPath: '$.ReserveCarRentalResult'
  })
    .addCatch(cancelRentalReservation, {
      resultPath: '$.ReserveCarRentalError'
    });

  /**
   * Confirm Reservations before Payment
   */
  console.log("TOPIC", topic);
  const sendEmailNotification = new Tasks.SnsPublish(scope, 'SendEmailNotification', {
    topic,
    message: Sfn.TaskInput.fromObject({
      default: 'Please confirm your car rental reservation by clicking the link below.',
      email: {
        subject: 'Confirm Your Reservation',
        message: `Please confirm your reservation by clicking the link below: https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/?taskToken=$$.Task.Token`, // Include the taskToken in the URL
      },
      taskToken: Sfn.JsonPath.taskToken
    }),
    integrationPattern: Sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
    resultPath: '$.taskToken',
  });

  /**
   * Payment
   */

  const refundPayment = new Tasks.LambdaInvoke(scope, 'RefundPayment', {
    lambdaFunction: refundPaymentLambda,
    resultPath: '$.RefundPaymentResult'
  })
    .addRetry({ maxAttempts: 3 })
    .next(cancelRentalReservation);

  const processPayment = new Tasks.LambdaInvoke(scope, 'ProcessPayment', {
    lambdaFunction: processPaymentLambda,
    resultPath: '$.ProcessPaymentResult'
  })
    .addCatch(refundPayment, {
      resultPath: '$.ProcessPaymentError'
    });

  /**
   * Confirm Flight and Car Rental reservation
   */

  const confirmFlight = new Tasks.LambdaInvoke(scope, 'ConfirmFlight', {
    lambdaFunction: confirmFlightLambda,
    resultPath: '$.ConfirmFlightResult'
  })
    .addCatch(refundPayment, {
      resultPath: '$.ConfirmFlightError'
    });

  const confirmCarRental = new Tasks.LambdaInvoke(scope, 'ConfirmCarRental', {
    lambdaFunction: confirmRentalLambda,
    resultPath: '$.ConfirmCarRentalResult'
  })
    .addCatch(refundPayment, {
      resultPath: '$.ConfirmCarRentalError'
    });

  return {
    reserveFlight,
    reserveCarRental,
    sendEmailNotification,
    processPayment,
    confirmFlight,
    confirmCarRental
  };
};

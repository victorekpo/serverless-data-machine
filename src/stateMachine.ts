import { Construct } from "constructs";
import * as Sfn from "aws-cdk-lib/aws-stepfunctions";
import * as Apigw from "aws-cdk-lib/aws-apigateway";
import { createDynamoDBTables } from "./dynamodb";
import { createLambdaFunctions } from "./lambda";
import { createNotifications } from "./notify";
import { createLambda } from "./utils/constructLambdas";

/**
 * Saga Pattern StepFunction
 * 1) Reserve Flight
 * 2) Reserve Car Rental
 * 3) Take Payment
 * 4) Confirm Flight and Car Rental Reservation
 */
export class StateMachine extends Construct {
  public Machine: Sfn.StateMachine;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    // Create DynamoDB Tables
    const tables = createDynamoDBTables(this);
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
    } = createLambdaFunctions(this, createLambda, tables);

    // Final States - Success or Failure, SNS Topic, and SNS Notifications
    const { reservationFailed, reservationSucceeded, topic, snsNotificationFailure, snsNotificationSuccess } = createNotifications(this);

    // End Constructor
  }
}
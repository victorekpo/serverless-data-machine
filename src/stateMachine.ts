import { Construct } from "constructs";
import * as Sfn from "aws-cdk-lib/aws-stepfunctions";
import * as Lambda from "aws-cdk-lib/aws-lambda";
import * as Apigw from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { createNotifications } from "./notify";
import { createReservationTasks } from "./reservationTasks";
import { join } from "path";

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

    // Final States - Success or Failure, SNS Topic, and SNS Notifications
    const notifications = createNotifications(this);

    const {
      reservationSucceeded,
      snsNotificationSuccess
    } = notifications;

    // Create Reservation Step Function Tasks
    const { reserveFlight, reserveCarRental, processPayment, confirmFlight, confirmCarRental } = createReservationTasks(this, notifications);

    // Step Function definition, chain Tasks
    const stepFunctionDefinition = Sfn.Chain
      .start(reserveFlight)
      .next(reserveCarRental)
      .next(processPayment)
      .next(confirmFlight)
      .next(confirmCarRental)
      .next(snsNotificationSuccess)
      .next(reservationSucceeded);

    const saga = new Sfn.StateMachine(this, "StateMachine", {
      definitionBody: Sfn.DefinitionBody.fromChainable(stepFunctionDefinition)
    });

    // AWS Lambda resource to connect to our API Gateway to kick off our step function

    const sagaLambda = new NodejsFunction(this, "sagaLambdaHandler", {
      runtime: Lambda.Runtime.NODEJS_20_X,
      entry: join("functions", "sagaLambda.ts"),
      bundling: {
        externalModules: [
          'aws-sdk'
        ]
      },
      environment: {
        statemachine_arn: saga.stateMachineArn
      }
    });

    saga.grantStartExecution(sagaLambda);

    /**
     * Simple API Gateway proxy integration
     */

    new Apigw.LambdaRestApi(this, "ServerlessSagaPattern", {
      handler: sagaLambda
    });
    // End Constructor
  }
}

import { Construct } from 'constructs';
import * as Sfn from 'aws-cdk-lib/aws-stepfunctions';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { createNotifications } from './notify';
import { createReservationTasks } from './reservationTasks';
import { createApiModels, linkApprovalApi, linkSagaApi } from "./api";
import { join } from 'path';

/**
 * Saga Pattern StepFunction
 * 1) Reserve Flight
 * 2) Reserve Car Rental
 * 3) Take Payment
 * 4) Confirm Flight and Car Rental Reservation
 */
export class StateMachine extends Construct {
  public Machine: Sfn.StateMachine;

  constructor(scope: Construct, id: string, api: RestApi, layers: LayerVersion[]) {
    super(scope, id);

    // Final States - Success or Failure, SNS Topic, and SNS Notifications
    const notifications = createNotifications(this);

    const {
      reservationSucceeded,
      snsNotificationSuccess
    } = notifications;

    // Create Reservation Step Function Tasks
    const { reserveFlight, reserveCarRental, confirmReservation, processPayment, confirmFlight, confirmCarRental } = createReservationTasks(this, notifications, api.url, layers);

    // Step Function definition, chain Tasks
    const stepFunctionDefinition = Sfn.Chain
      .start(reserveFlight)
      .next(reserveCarRental)
      .next(confirmReservation) // waits for user interaction (approval)
      .next(processPayment)
      .next(confirmFlight)
      .next(confirmCarRental)
      .next(snsNotificationSuccess)
      .next(reservationSucceeded);

    const saga = new Sfn.StateMachine(this, 'StateMachine', {
      definitionBody: Sfn.DefinitionBody.fromChainable(stepFunctionDefinition)
    });

    // AWS Lambda resource to connect to our API Gateway to kick off our step function
    const sagaLambda = new NodejsFunction(this, 'sagaLambdaHandler', {
      runtime: Runtime.NODEJS_20_X,
      entry: join('src', 'functions', 'sagaLambda.ts'),
      environment: {
        statemachine_arn: saga.stateMachineArn
      },
      ...(layers && { layers })
    });

    saga.grantStartExecution(sagaLambda);

    // Create Api Models (request, response)
    const { responseModel } = createApiModels(scope, api);

    // Link Saga to API
    linkSagaApi(scope, api, sagaLambda, responseModel);

    // AWS Lambda resource to approve requests and linked to API Gateway
    const approvalLambda = new NodejsFunction(this, 'approvalLambdaHandler', {
      runtime: Runtime.NODEJS_20_X,
      entry: join('src', 'functions', 'confirm', 'approveReservation.ts'),
    });

    approvalLambda.addToRolePolicy(new PolicyStatement({
      actions: ['states:SendTaskSuccess'],
      resources: ['*'] // Can restrict this to specific state machines
    }));

    // Link Approval Lambda to API
    linkApprovalApi(scope, api, approvalLambda, responseModel);
    // End Constructor
  }
}

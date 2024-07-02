import { Construct } from "constructs";
import * as Sfn from "aws-cdk-lib/aws-stepfunctions";
import * as Sns from "aws-cdk-lib/aws-sns";
import * as Subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as Tasks from "aws-cdk-lib/aws-stepfunctions-tasks";

export const createNotifications = (scope: Construct) => {
  const reservationFailed = new Sfn.Fail(scope, "Reservation failed", { error: "Job failed" });

  const reservationSucceeded = new Sfn.Succeed(scope, "Reservation Successful!");

  const topic = new Sns.Topic(scope, "Topic");
  topic.addSubscription(new Subscriptions.EmailSubscription('victor.ekpo@gmail.com'));


  const snsNotificationFailure = new Tasks.SnsPublish(scope, "sendingEmailFailure", {
    topic,
    integrationPattern: Sfn.IntegrationPattern.REQUEST_RESPONSE,
    message: Sfn.TaskInput.fromText("Your Travel Reservation Failed")
  });

  const snsNotificationSuccess = new Tasks.SnsPublish(scope, "sendingEmailSuccess", {
    topic,
    integrationPattern: Sfn.IntegrationPattern.REQUEST_RESPONSE,
    message: Sfn.TaskInput.fromText("Your Travel Reservation is successful")
  });

  return {
    reservationFailed,
    reservationSucceeded,
    snsNotificationFailure,
    snsNotificationSuccess
  };
};
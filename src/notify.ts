import * as Sfn from "aws-cdk-lib/aws-stepfunctions";
import * as Sns from "aws-cdk-lib/aws-sns";
import * as Subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as Tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

export const createNotifications = (scope: Construct) => {
  const reservationFailed = new Sfn.Fail(scope, "Reservation failed", { error: "Job failed" });

  const reservationSucceeded = new Sfn.Succeed(scope, "Reservation Successful!");

  const topic = new Sns.Topic(scope, "Topic");
  topic.addSubscription(new Subscriptions.SmsSubscription("+12817146701"));

  const snsNotificationFailure = new Tasks.SnsPublish(scope, "sendingSMSFailure", {
    topic,
    integrationPattern: Sfn.IntegrationPattern.REQUEST_RESPONSE,
    message: Sfn.TaskInput.fromText("Your Travel Reservation Failed")
  });

  const snsNotificationSuccess = new Tasks.SnsPublish(scope, "sendingSMSSuccess", {
    topic,
    integrationPattern: Sfn.IntegrationPattern.REQUEST_RESPONSE,
    message: Sfn.TaskInput.fromText("Your Travel Reservation is sucecssful")
  });

  return {
    reservationFailed,
    reservationSucceeded,
    topic,
    snsNotificationFailure,
    snsNotificationSuccess
  };
};
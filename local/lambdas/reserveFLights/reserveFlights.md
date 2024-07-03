## Local Testing of Lambda Functions
```
sam local invoke StateMachinereserveFlightLambdaHandler77D8E840 -t ./cdk.out/CdkServerlessSagaStack.template.json
``` 

## Local Testing of API
```
sam local start-api
```

[Local Step Functions Testing](https://docs.aws.amazon.com/step-functions/latest/dg/sfn-local-lambda.html)

[Local SAM Testing](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-cdk-getting-started.html)

Examples
-`cdk synth && sam local invoke StateMachinereserveFlightLambdaHandler77D8E840 -t ./cdk.out/CdkServerlessSagaStack.template.json --env-vars ./env.json --event ./event.json`
#!/bin/bash

npm run synth

# sam.cmd for windows regular sam for linux/mac
sam.cmd local invoke StateMachinereserveFlightLambdaHandler77D8E840 \
  -t ../../../cdk.out/SagaStack-Demo.template.json \
  --env-vars ./env.json \
  --event ./event.json

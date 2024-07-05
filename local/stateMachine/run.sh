#!/bin/bash

npm run synth

# state machines require arn in aws to execute
aws stepfunctions start-execution \
  --endpoint http://localhost:8083 \
  --state-machine arn:aws:states:us-east-1:123456789012:stateMachine:HelloWorld \
  --name test
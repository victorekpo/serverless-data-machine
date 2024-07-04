#!/bin/bash

npm run synth

# sam.cmd for windows regular sam for linux/mac
sam.cmd local step-functions invoke MyStateMachine \
  -t ../../cdk.out/CdkServerlessSagaStack.template.json \
  --event ./event.json

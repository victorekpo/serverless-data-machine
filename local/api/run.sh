#!/bin/bash

npm run synth

## sam.cmd for windows regular sam for linux/mac
sam.cmd build \
  -t ../../cdk.out/SagaStack-Demo.template.json

sam.cmd local start-api

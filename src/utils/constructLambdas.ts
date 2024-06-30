import { join } from "path";
import * as Lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Table } from "aws-cdk-lib/aws-dynamodb";

export const createLambda = (scope: Construct, id: string, handler: string, table: Table) => {
  const fn = new NodejsFunction(scope, id, {
    runtime: Lambda.Runtime.NODEJS_20_X,
    entry: join('functions', handler),
    bundling: {
      externalModules: [
        'aws-sdk'
      ],
      environment: {
        TABLE_NAME: table.tableName
      }
    }
  });

  // Give Lambda permissions to read and write data from the DynamoDB table
  table.grantReadWriteData(fn);

  return fn;
};
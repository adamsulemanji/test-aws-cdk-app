import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { SQS } from './sqs';
import { ApiGateway } from './apigateway';


export class TestAwsCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new SQS(this, 'SQS');
    new ApiGateway(this, 'ApiGateway');

  }
}
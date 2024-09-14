import * as cdk from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';

import { Construct } from 'constructs';

export class TestAwsCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    new Queue(this, 'TestAwsCdkAppQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    new Queue(this, 'TestAwsCdkAppDeadLetterQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });
  }
}
import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';

  
export class SQS extends Construct {

  constructor(scope: Construct, id: string) {
    super(scope, id);

    new sqs.Queue(this, 'TestAwsCdkAppQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    new sqs.Queue(this, 'TestAwsCdkAppDeadLetterQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    new sqs.Queue(this, 'TestAwsCdkAppQueue2', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });
  }
}
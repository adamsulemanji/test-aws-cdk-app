import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';

export class SNSConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const myTopic = new sns.Topic(this, 'MyTopic');
  }
}

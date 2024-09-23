import { Construct } from 'constructs';

import * as sns from 'aws-cdk-lib/aws-sns';

export class SNSConstruct extends Construct {
  public readonly sendMessage: sns.Topic;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.sendMessage = new sns.Topic(this, 'SMSTopic', {
      displayName: 'SMS Notifications Topic',
    });
  }
}

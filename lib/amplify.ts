import * as cdk from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import { Construct } from 'constructs';

export class AmplifyConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }
}

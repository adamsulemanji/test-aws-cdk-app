import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as apig from 'aws-cdk-lib/aws-apigateway';


export class ApiGateway extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
    
        new apig.RestApi(this, 'TestAwsCdkAppApiGateway', {
            deployOptions: {
                stageName: 'test'
            }
        });
    }
}

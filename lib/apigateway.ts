import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as apig from 'aws-cdk-lib/aws-apigateway';


export class ApiGateway extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
    
        const base = new apig.RestApi(this, 'TestAwsCdkAppApiGateway', {
            deployOptions: {
                stageName: 'test'
            }
        });

        const resource = base.root.addResource('test');
        resource.addMethod('GET');


        const resource2 = base.root.addResource('test2');
        resource2.addMethod('GET');
        resource2.addMethod('POST');
    }
}

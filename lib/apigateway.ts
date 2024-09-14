import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as apig from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';


export class ApiGateway extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
    
        const base = new apig.RestApi(this, 'TestAwsCdkAppApiGateway', {
            deployOptions: {
                stageName: 'test'
            }
        });

        const resource = base.root.addResource('test');

        const test1Lambda = new lambda.Function(this, 'Test1Lambda', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'test1_GET.handler',
            code: lambda.Code.fromAsset('lambdas')
        });

        const test1Integration = new apig.LambdaIntegration(test1Lambda);
        resource.addMethod('GET', test1Integration);

        const resource2 = base.root.addResource('test2');
        resource2.addMethod('GET');
        resource2.addMethod('POST');
    }
}

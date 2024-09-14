import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';
import * as apig from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ApiGateway extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const base = new apig.RestApi(this, 'TestAwsCdkAppApiGateway', {
    });

    const resource = base.root.addResource('test');
    const test1Lambda = new lambda.Function(this, 'Test1Lambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'test1_GET.handler',
      code: lambda.Code.fromAsset('lib/lambdas')
    });
    const test1Integration = new apig.LambdaIntegration(test1Lambda);
    resource.addMethod('GET', test1Integration);

    const resource2 = base.root.addResource('test2');

    // Create a new Lambda function for test2
    const test2Lambda = new lambda.Function(this, 'Test2Lambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'test2.handler',
      code: lambda.Code.fromAsset('lib/lambdas')
    });

    // Create a Lambda integration for test2
    const test2Integration = new apig.LambdaIntegration(test2Lambda);

    // Add the Lambda integration to the GET and POST methods
    resource2.addMethod('GET', test2Integration);
    resource2.addMethod('POST', test2Integration);
  }
}
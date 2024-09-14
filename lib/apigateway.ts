import { Construct } from 'constructs';
import * as apig from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class ApiGateway extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const base = new apig.RestApi(this, 'TestAwsCdkAppApiGateway', {
        restApiName: 'TestAwsCdkAppApiGateway',
        description: 'This is a test API Gateway',
    });

    const resource = base.root.addResource('test');
    const testLambda = new lambda.Function(this, 'TestLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'test.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '/../lambda')),
    });
    const testIntegration = new apig.LambdaIntegration(testLambda);
    resource.addMethod('GET', testIntegration);
  }
}
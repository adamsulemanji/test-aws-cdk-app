import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as fs from 'fs';

export class ApiGatewayConstruct extends Construct {
  constructor(scope: Construct, id: string, lambdas: lambda.Function[]) {
    super(scope, id);

    // Create API Gateway
    const base = new apigateway.RestApi(this, 'TestAwsCdkAppApiGateway', {
      restApiName: 'TestAwsCdkAppApiGateway',
      description: 'This is a test API Gateway',
    });

    // Lambda for creating orders
    const orders = base.root.addResource('orders');
    const createOrderIntegration = new apigateway.LambdaIntegration(lambdas[0]);
    orders.addMethod('POST', createOrderIntegration);

    // Lambda for getting user
    const users = base.root.addResource('users');
    const getUserIntegration = new apigateway.LambdaIntegration(lambdas[1]);
    users.addMethod('GET', getUserIntegration);

    // Lambda for updating orders
    const updateOrder = orders.addResource('{orderId}');
    const updateOrderIntegration = new apigateway.LambdaIntegration(lambdas[2]);
    updateOrder.addMethod('PUT', updateOrderIntegration);
  }
}

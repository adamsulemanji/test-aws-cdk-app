// api-gateway-construct.ts

import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ApiGatewayConstruct extends Construct {
  constructor(scope: Construct, id: string, lambdaFunction: lambda.Function[]) {
    super(scope, id);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'TestAwsCdkAppApiGateway', {
      restApiName: 'TestAwsCdkAppApiGateway',
      description: 'This is a test API Gateway',
    });

    // Resource: /orders
    const orders = api.root.addResource('orders');
    const ordersIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[0],
    );

    // Methods on /orders
    orders.addMethod('GET', ordersIntegration);
    orders.addMethod('POST', ordersIntegration);

    // Resource: /orders/{orderId}
    const orderById = orders.addResource('{orderId}');
    const orderByIdIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[0],
    );

    // Methods on /orders/{orderId}
    orderById.addMethod('GET', orderByIdIntegration);
    orderById.addMethod('PATCH', orderByIdIntegration);
  }
}

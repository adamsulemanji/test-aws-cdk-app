import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ApiGatewayConstruct extends Construct {
  constructor(scope: Construct, id: string, lambdaFunction: lambda.Function[]) {
    super(scope, id);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'OrdersAPIGateway', {
      restApiName: 'OrdersAPIGateway',
      description: 'APIGateway for Orders service in testing purposes',
      defaultCorsPreflightOptions: {
        allowOrigins: ["'*'"],
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Resource: /orders
    const orders = api.root.addResource('orders');
    const ordersIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[0],
    );

    // Methods on /orders
    orders.addMethod('GET', ordersIntegration);
    orders.addMethod('POST', ordersIntegration);

    // ********** New Resource **********

    // Resource: /orders/{orderId}
    const orderById = orders.addResource('{orderId}');
    const orderByIdIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[0],
    );

    // Methods on /orders/{orderId}
    orderById.addMethod('GET', orderByIdIntegration);
    orderById.addMethod('PATCH', orderByIdIntegration);
    orderById.addMethod('DELETE', orderByIdIntegration);

    // ********** New Resource **********

    // Resource /orders/random
    const random = orders.addResource('random');
    const randomIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[0],
    );

    // Methods on /orders/random
    random.addMethod('GET', randomIntegration);

    // ********** New Resource **********
    const sendMessage = api.root.addResource('sendMessage');
    const sendMessageIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[1],
    );

    sendMessage.addMethod('POST', sendMessageIntegration);
  }
}

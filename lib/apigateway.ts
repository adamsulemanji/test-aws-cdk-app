import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class ApiGatewayConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    lambdaFunction: lambda.Function[],
    userPool: cognito.UserPool,
  ) {
    super(scope, id);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'OrdersAPIGateway', {
      restApiName: 'OrdersAPIGateway',
      description: 'APIGateway for Orders service in testing purposes',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
    });

    // Create Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'OrdersAPIGatewayAuthorizer',
      {
        cognitoUserPools: [userPool],
      },
    );

    // Resource: /orders
    const orders = api.root.addResource('orders');
    const ordersIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[0],
    );

    // Methods on /orders with Cognito Authorizer
    orders.addMethod('GET', ordersIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    orders.addMethod('POST', ordersIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Resource: /orders/{orderId}
    const orderById = orders.addResource('{orderId}');
    const orderByIdIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[0],
    );

    // Methods on /orders/{orderId} with Cognito Authorizer
    orderById.addMethod('GET', orderByIdIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    orderById.addMethod('PATCH', orderByIdIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    orderById.addMethod('DELETE', orderByIdIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Resource: /orders/random
    const random = orders.addResource('random');
    const randomIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[0],
    );

    random.addMethod('GET', randomIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Resource: /sendMessage
    const sendMessage = api.root.addResource('sendMessage');
    const sendMessageIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[1],
    );

    sendMessage.addMethod('POST', sendMessageIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Resource: /eventBridgeToggle
    const eventBridgeToggle = api.root.addResource('eventBridgeToggle');
    const eventBridgeToggleIntegration = new apigateway.LambdaIntegration(
      lambdaFunction[2],
    );

    eventBridgeToggle.addMethod('POST', eventBridgeToggleIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }
}

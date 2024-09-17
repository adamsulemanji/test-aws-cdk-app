import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from './apigateway';
import { LambdaConstruct } from './lambda';
import { DynamoDBConstruct } from './dynamodb';

export class TestAwsCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB tables
    const dynamoDbConstruct = new DynamoDBConstruct(this, 'DynamoDBConstruct');


    // Create Lambda functions and pass the DynamoDB table names
    const lambdaConstruct = new LambdaConstruct(
      this, 
      'LambdaConstruct',
      dynamoDbConstruct.tables
    );

    // Grant Lambdas access to the respective DynamoDB tables
    dynamoDbConstruct.tables[0].grantFullAccess(lambdaConstruct.createOrderLambda);
    dynamoDbConstruct.tables[0].grantFullAccess(lambdaConstruct.updateOrderLambda);
    dynamoDbConstruct.tables[1].grantFullAccess(lambdaConstruct.getUserLambda);

    // Create API Gateway and connect to the Lambda functions
    new ApiGatewayConstruct(this, 'ApiGatewayConstruct', [
      lambdaConstruct.createOrderLambda,
      lambdaConstruct.getUserLambda,
      lambdaConstruct.updateOrderLambda
    ]);
  }
}

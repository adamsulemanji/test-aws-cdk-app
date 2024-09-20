import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from './apigateway';
import { LambdaConstruct } from './lambda';
import { DynamoDBConstruct } from './dynamodb';
import { SNSConstruct } from './sns';
import { SQSConstruct } from './sqs';

export class TestAwsCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB tables
    const dynamoDbConstruct = new DynamoDBConstruct(this, 'DynamoDBConstruct');

    // Create Lambda functions and pass the DynamoDB table names
    const lambdaConstruct = new LambdaConstruct(this, 'LambdaConstruct', [
      dynamoDbConstruct.ordersTable,
      dynamoDbConstruct.usersTable,
    ]);

    // Grant Lambdas access to the respective DynamoDB tables
    // Grant appropriate permissions to each Lambda
    dynamoDbConstruct.usersTable.grantReadData(lambdaConstruct.getUserLambda);
    dynamoDbConstruct.ordersTable.grantWriteData(lambdaConstruct.getUserLambda);
    dynamoDbConstruct.ordersTable.grantWriteData(
      lambdaConstruct.createOrderLambda,
    );
    dynamoDbConstruct.ordersTable.grantReadWriteData(
      lambdaConstruct.updateOrderLambda,
    );

    // Create API Gateway and connect to the Lambda functions
    new ApiGatewayConstruct(this, 'ApiGatewayConstruct', [
      lambdaConstruct.createOrderLambda,
      lambdaConstruct.getUserLambda,
      lambdaConstruct.updateOrderLambda,
    ]);

    const sqsConstruct = new SQSConstruct(this, 'SQSConstruct');
    const snsConstruct = new SNSConstruct(this, 'SNSConstruct');
  }
}

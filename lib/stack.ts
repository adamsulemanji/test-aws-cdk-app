import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from './apigateway';
import { LambdaConstruct } from './lambda';
import { DynamoDBConstruct } from './dynamodb';
import { SNSConstruct } from './sns';
import { SQSConstruct } from './sqs';

export class TestAwsCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ******** Create DynamoDB tables ********
    const dynamoDbConstruct = new DynamoDBConstruct(this, 'DynamoDBConstruct');

    // ******** Create SNS Topic ********
    const snsConstruct = new SNSConstruct(this, 'SNSConstruct');
    // https://github.com/ShareMyWebStuff/SendSMS/blob/main/lib/send_sms-stack.ts

    // ******** Create SQS Queue ********
    const sqsConstruct = new SQSConstruct(this, 'SQSConstruct');

    // ******** Create Lambda Functions ********
    const lambdaConstruct = new LambdaConstruct(
      this,
      'LambdaConstruct',
      [dynamoDbConstruct.ordersTable],
      snsConstruct.sendMessage,
    );

    // ******** Create API Gateway ********
    new ApiGatewayConstruct(this, 'ApiGatewayConstruct', [
      lambdaConstruct.orders,
      lambdaConstruct.sendMessage,
    ]);

    // ********** Grant Permissions **********
    dynamoDbConstruct.ordersTable.grantFullAccess(lambdaConstruct.orders);
    lambdaConstruct.sendMessage.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: ['arn:aws:sns:*:*:*'],
        conditions: {
          StringEquals: {
            'sns:protocol': 'sms',
          },
        },
      }),
    );
  }
}

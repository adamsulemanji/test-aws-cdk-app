import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from './apigateway';
import { LambdaConstruct } from './lambda';
import { DynamoDBConstruct } from './dynamodb';
import { SNSConstruct } from './sns';
import { SQSConstruct } from './sqs';
import { FrontendConstruct } from './cloudfront';
import { RDSConstruct } from './rds';

export class TestAwsCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ******** Create DynamoDB tables ********
    const dynamoDbConstruct = new DynamoDBConstruct(this, 'DynamoDBConstruct');

    // ******** Create RDS Instance ********
    const rdsConstruct = new RDSConstruct(this, 'RDSConstruct');

    // ******** Create SNS Topic ********
    const snsConstruct = new SNSConstruct(this, 'SNSConstruct');

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

    // ********** Frontend Construct **********
    new FrontendConstruct(this, 'FrontendConstruct');

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

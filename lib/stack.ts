import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { FrontendConstruct } from './cloudfront'; // Adjust path if needed
import { Pipeline } from './pipeline'; // Adjust path if needed

// Other constructs you had (DynamoDBConstruct, etc.)
import { ApiGatewayConstruct } from './apigateway';
import { LambdaConstruct } from './lambda';
import { DynamoDBConstruct } from './dynamodb';
import { SNSConstruct } from './sns';
import { SQSConstruct } from './sqs';
import { RDSConstruct } from './rds';
import { EventConstruct } from './eventbridge';
import { CognitoConstruct } from './cognito';

export class TestAwsCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ********** Create the Frontend infra (Bucket, CloudFront, Route53, etc.) **********
    const frontendConstruct = new FrontendConstruct(this, 'FrontendConstruct');

    // ********** Create DynamoDB, SNS, SQS, Cognito, etc. **********
    const dynamoDbConstruct = new DynamoDBConstruct(this, 'DynamoDBConstruct');
    const snsConstruct = new SNSConstruct(this, 'SNSConstruct');
    const sqsConstruct = new SQSConstruct(this, 'SQSConstruct');
    const cognitoConstruct = new CognitoConstruct(this, 'CognitoConstruct');

    // ********** Create Lambdas **********
    const lambdaConstruct = new LambdaConstruct(
      this,
      'LambdaConstruct',
      [dynamoDbConstruct.ordersTable],
      snsConstruct.sendMessage,
    );

    // ********** Create EventBridge Rule **********
    const eventBridgeConstruct = new EventConstruct(
      this,
      'EventConstruct',
      lambdaConstruct.eventBridgeLambda,
    );

    lambdaConstruct.eventBridgeToggleLambda.addEnvironment(
      'RULE_NAME',
      eventBridgeConstruct.eventRule.ruleName,
    );

    // ********** Create API Gateway **********
    new ApiGatewayConstruct(
      this,
      'ApiGatewayConstruct',
      [
        lambdaConstruct.orders,
        lambdaConstruct.sendMessage,
        lambdaConstruct.eventBridgeToggleLambda,
      ],
      cognitoConstruct.userPool,
    );

    // ********** Grant Permissions **********
    dynamoDbConstruct.ordersTable.grantFullAccess(lambdaConstruct.orders);
    lambdaConstruct.sendMessage.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: [snsConstruct.sendMessage.topicArn],
        conditions: {
          StringEquals: {
            'sns:protocol': 'sms',
          },
        },
      }),
    );
    lambdaConstruct.eventBridgeToggleLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'events:DescribeRule',
          'events:EnableRule',
          'events:DisableRule',
        ],
        resources: [eventBridgeConstruct.eventRule.ruleArn],
      }),
    );

    // ********** Finally, create the Pipeline stack **********
    // Pass the frontendConstruct so the pipeline knows where to upload the React build
    new Pipeline(this, 'Pipeline2', {
      frontendConstruct,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });
  }
}

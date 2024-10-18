import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as sns from 'aws-cdk-lib/aws-sns';

export class LambdaConstruct extends Construct {
  public readonly orders: lambda.Function;
  public readonly sendMessage: lambda.Function;
  public readonly eventBridgeLambda: lambda.Function;
  public readonly eventBridgeToggleLambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    dynamos: dynamodb.Table[],
    smsTopic: sns.Topic,
  ) {
    super(scope, id);

    // ******* Get the DynamoDB table name *******
    const ordersTableName = dynamos[0].tableName;

    // ********** Lambda for orders **********
    this.orders = new lambda.Function(this, 'OrdersLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'orders.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        USERS_TABLE_NAME: ordersTableName,
      },
    });

    // ********** Lambda for sending SMS **********

    this.sendMessage = new lambda.Function(this, 'SendSmsLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'sendMessage.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // Path to your lambda code
      environment: {
        SMS_TOPIC_ARN: smsTopic.topicArn, // Pass the SNS topic ARN to Lambda
      },
    });

    // ********** Lambda for EventBridge rule **********
    this.eventBridgeLambda = new lambda.Function(this, 'EventBridgeLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'eventbridge.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
    });

    // ********** Lambda for toggling the EventBridge rule **********
    this.eventBridgeToggleLambda = new lambda.Function(
      this,
      'EventBridgeToggleLambda',
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'eventBridgeToggle.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      },
    );
  }
}

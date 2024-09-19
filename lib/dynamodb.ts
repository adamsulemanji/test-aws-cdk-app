import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoDBConstruct extends Construct {
  public readonly ordersTable: dynamodb.Table;
  public readonly usersTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Orders Table
    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      tableName: 'OrdersTable',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Users Table
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      tableName: 'UsersTable',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}

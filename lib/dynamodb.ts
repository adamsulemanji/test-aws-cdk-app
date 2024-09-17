import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoDBConstruct extends Construct {
  public readonly tables: dynamodb.Table[];

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Orders Table
    const ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      tableName: 'OrdersTable',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Users Table
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      tableName: 'UsersTable',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.tables = [ordersTable, usersTable];
  }
}

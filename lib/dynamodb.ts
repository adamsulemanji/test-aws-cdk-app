import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDBConstruct extends Construct {
  public readonly ordersTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Orders Table
    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      tableName: 'OrdersTable',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}

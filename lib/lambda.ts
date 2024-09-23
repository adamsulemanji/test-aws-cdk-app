import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class LambdaConstruct extends Construct {
  public readonly orders: lambda.Function;

  constructor(scope: Construct, id: string, dynamos: dynamodb.Table[]) {
    super(scope, id);

    const ordersTableName = dynamos[0].tableName;

    // Lambda for getting orders
    this.orders = new lambda.Function(this, 'OrdersLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'orders.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        USERS_TABLE_NAME: ordersTableName,
      },
    });
  }
}

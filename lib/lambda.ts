import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class LambdaConstruct extends Construct {
  public readonly createOrderLambda: lambda.Function;
  public readonly getUserLambda: lambda.Function;
  public readonly updateOrderLambda: lambda.Function;

  constructor(scope: Construct, id: string, dynamos: dynamodb.Table[]) {
    super(scope, id);

    const ordersTableName = dynamos[0].tableName;
    const usersTableName = dynamos[1].tableName;
    
    // Lambda for creating orders
    this.createOrderLambda = new lambda.Function(this, 'CreateOrderLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'test.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/lambda/test.js')),
      environment: {
        ORDERS_TABLE_NAME: ordersTableName,
      },
    });

    // Lambda for getting user
    this.getUserLambda = new lambda.Function(this, 'GetUserLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'test.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/lambda/test.js')),
      environment: {
        USERS_TABLE_NAME: usersTableName,
      },
    });

    // Lambda for updating orders
    this.updateOrderLambda = new lambda.Function(this, 'UpdateOrderLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'test.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/lambda/test.js')),
      environment: {
        ORDERS_TABLE_NAME: ordersTableName,
      },
    });
  }
}

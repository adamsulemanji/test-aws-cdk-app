// ordersHandler.js

const {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  GetItemCommand,
  ScanCommand,
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const ddbClient = new DynamoDBClient({});

const TABLE_NAME = 'OrdersTable';

const handler = async (event) => {
  const method = event.httpMethod;
  const resource = event.resource;
  const pathParameters = event.pathParameters || {};
  const orderId = pathParameters.orderId;
  const body = event.body;

  try {
    if (method === 'GET' && resource === '/orders') {
      // GET /orders - Retrieve all orders
      const params = {
        TableName: TABLE_NAME,
      };

      const data = await ddbClient.send(new ScanCommand(params));
      const items = data.Items.map((item) => unmarshall(item));

      return {
        statusCode: 200,
        body: JSON.stringify(items),
      };
    } else if (method === 'GET' && resource === '/orders/{orderId}') {
      // GET /orders/{orderId} - Retrieve a specific order
      if (!orderId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'orderId is required in path parameters',
          }),
        };
      }

      const params = {
        TableName: TABLE_NAME,
        Key: {
          orderId: { S: orderId },
        },
      };

      const data = await ddbClient.send(new GetItemCommand(params));

      if (!data.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Order not found' }),
        };
      }

      const item = unmarshall(data.Item);

      return {
        statusCode: 200,
        body: JSON.stringify(item),
      };
    } else if (method === 'POST' && resource === '/orders') {
      // POST /orders - Create a new order
      const newOrderId = Math.random().toString(36).substring(2, 15);
      const timestamp = new Date().toISOString();

      let requestBody = {};
      if (body) {
        try {
          requestBody = JSON.parse(body);
        } catch (err) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid JSON in request body' }),
          };
        }
      }

      const item = {
        orderId: { S: newOrderId },
        timestamp: { S: timestamp },
        ...Object.entries(requestBody).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            acc[key] = { S: value };
          } else if (typeof value === 'number') {
            acc[key] = { N: value.toString() };
          } else if (typeof value === 'boolean') {
            acc[key] = { BOOL: value };
          } else {
            acc[key] = { S: JSON.stringify(value) };
          }
          return acc;
        }, {}),
      };

      const params = {
        TableName: TABLE_NAME,
        Item: item,
      };

      await ddbClient.send(new PutItemCommand(params));

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: 'Order created successfully',
          orderId: newOrderId,
        }),
      };
    } else if (method === 'PATCH' && resource === '/orders/{orderId}') {
      // PATCH /orders/{orderId} - Update order timestamp
      if (!orderId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'orderId is required in path parameters',
          }),
        };
      }

      const timestamp = new Date().toISOString();

      const params = {
        TableName: TABLE_NAME,
        Key: {
          orderId: { S: orderId },
        },
        UpdateExpression: 'SET #timestamp = :timestamp',
        ExpressionAttributeNames: {
          '#timestamp': 'timestamp',
        },
        ExpressionAttributeValues: {
          ':timestamp': { S: timestamp },
        },
        ReturnValues: 'UPDATED_NEW',
      };

      await ddbClient.send(new UpdateItemCommand(params));

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Order timestamp updated successfully',
          orderId: orderId,
        }),
      };
    } else {
      // Method Not Allowed
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
    }
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: err.message,
      }),
    };
  }
};

module.exports = { handler };

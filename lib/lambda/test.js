const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Agent } from "https";

const ddbClient = new DynamoDBClient({
      requestHandler: new NodeHttpHandler({
      httpsAgent: new Agent({ keepAlive: false })
  })
});

const handler = async (event) => {
  const orderId = Math.random().toString(36).substring(2, 15);

  const params = {
    TableName: "OrdersTable",
    Item: {
      orderId: { S: orderId },
      timestamp: { S: timestamp },
    },
  };

  try {
    await ddbClient.send(new PutItemCommand(params));
    return { statusCode: 200, body: JSON.stringify({ message: "Success", orderId: orderId }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Error", error: err.message }) };
  }
};

module.exports = { handler };
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const ddbClient = new DynamoDBClient(); // Set your region

const handler = async (event) => {
  const orderId = Math.random().toString(36).substring(2, 15); // Generate a random orderId
  const timestamp = new Date().toISOString(); // Get current timestamp

  // Parameters for the PutItemCommand
  const params = {
    TableName: "OrdersTable",
    Item: {
      orderId: { S: orderId }, // Use String type for orderId
      timestamp: { S: timestamp },
    },
  };

  try {
    // Insert the item into DynamoDB
    await ddbClient.send(new PutItemCommand(params));
    return { statusCode: 200, body: JSON.stringify({ message: "Success", orderId: orderId }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Error", error: err.message }) };
  }
};

module.exports = { handler };
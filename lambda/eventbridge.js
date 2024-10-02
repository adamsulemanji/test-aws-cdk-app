const handler = async (event) => {
  console.log('Event: Invoke by Event Bridge at ' + new Date());
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Event Bridge Lambda!'),
  };
};

module.exports = { handler };

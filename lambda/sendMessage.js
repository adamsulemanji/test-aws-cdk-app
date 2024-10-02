const AWS = require('aws-sdk');
const sns = new AWS.SNS();

const handler = async (event) => {
  const body = JSON.parse(event.body);
  const phoneNumber = body.phoneNumber;
  const message = body.message;

  const params = {
    Message: message,
    PhoneNumber: phoneNumber,
  };

  try {
    await sns.publish(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'SMS sent successfully!' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send SMS', error }),
    };
  }
};

module.exports = { handler };

import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Lambda!',
      path: event.path,
    }),
  };
};

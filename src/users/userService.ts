import { APIGatewayProxyResult } from 'aws-lambda'

import { DefaultHeaders, HttpAPIEvent } from '../types'
import { handleUserGet } from './userGet'
import { handleUserPost } from './userPost'

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: HttpAPIEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, body, queryStringParameters } = event
    console.log({
      httpMethod,
      body,
      queryStringParameters,
    })

    switch (httpMethod) {
      case 'OPTIONS':
        return {
          statusCode: 200,
          headers: { ...DefaultHeaders },
          body: '',
        }
      case 'GET':
        return handleUserGet(event)
      case 'POST':
        return handleUserPost(event)
    }

    return {
      statusCode: 400,
      headers: { ...DefaultHeaders },
      body: JSON.stringify({
        message: `invalid httpMethod, received "${httpMethod}"`,
      }),
    }
  } catch (error: any) {
    console.error(error)
    return {
      statusCode: 500,
      headers: { ...DefaultHeaders },
      body: JSON.stringify({
        message: error.message ?? error,
      }),
    }
  }
}

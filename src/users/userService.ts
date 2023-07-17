import { APIGatewayProxyResult } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'

import { DefaultHeaders, HttpAPIEvent, User } from '../types'
import { getAllUsers, saveAllUsers } from '../clients/sqs'

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const handleUserGet = async (event: HttpAPIEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.queryStringParameters?.id
  const users = await getAllUsers()
  await saveAllUsers(users)

  if (!userId) {
    return {
      statusCode: 200,
      headers: { ...DefaultHeaders },
      body: JSON.stringify(users),
    }
  }

  const foundUser = users.find((u) => u.user.id === userId)
  if (!foundUser) {
    return {
      statusCode: 400,
      headers: { ...DefaultHeaders },
      body: JSON.stringify({
        message: `Failed to get user by id "${userId}"`,
      }),
    }
  }

  return {
    statusCode: 200,
    headers: { ...DefaultHeaders },
    body: JSON.stringify(foundUser),
  }
}
export const handleUserPost = async (event: HttpAPIEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { ...DefaultHeaders },
      body: JSON.stringify({
        message: `Failed to create user "${event.body}"`,
      }),
    }
  }
  const nextUser = JSON.parse(event.body) as User

  const allUsers = await getAllUsers()
  nextUser.id = uuidv4()
  allUsers.push({
    receiptHandle: '',
    user: nextUser,
  })
  await saveAllUsers(allUsers)

  return {
    statusCode: 200,
    headers: { ...DefaultHeaders },
    body: event.body,
  }
}

export const lambdaHandler = async (event: HttpAPIEvent): Promise<APIGatewayProxyResult> => {
  try {
    switch (event.httpMethod) {
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
      default:
        return {
          statusCode: 400,
          headers: { ...DefaultHeaders },
          body: JSON.stringify({
            message: `invalid httpMethod, received "${event.httpMethod}"`,
          }),
        }
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

import { APIGatewayProxyResult } from 'aws-lambda'
import { DefaultHeaders, HttpAPIEvent, User } from '../types'
import { clearUserMessages, getUserMessages, sendUserMessages } from '../clients/sqs'

export const handleUserGet = async (event: HttpAPIEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.queryStringParameters?.id
  const userMessages = await getUserMessages()

  const users = userMessages.map((m) => JSON.parse(m.Body ?? '{}') as User)

  await Promise.all([sendUserMessages(users), clearUserMessages(userMessages)])

  if (!userId) {
    return {
      statusCode: 200,
      headers: { ...DefaultHeaders },
      body: JSON.stringify(users),
    }
  }

  const foundUser = users.find((u) => u.id === userId)
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

import { APIGatewayProxyResult } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { DefaultHeaders, HttpAPIEvent, User } from '../types'
import { clearUserMessages, getUserMessages, sendUserMessages } from '../clients/sqs'

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
  const userMessages = await getUserMessages()
  const users = userMessages.map((m) => JSON.parse(m.Body ?? '{}') as User)

  const nextUser = JSON.parse(event.body) as User
  nextUser.id = uuidv4()
  users.push(nextUser)

  await Promise.all([sendUserMessages(users), clearUserMessages(userMessages)])

  return {
    statusCode: 200,
    headers: { ...DefaultHeaders },
    body: event.body,
  }
}

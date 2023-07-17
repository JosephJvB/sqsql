import {
  SQSClient,
  ReceiveMessageCommand,
  Message,
  SendMessageBatchCommand,
  DeleteMessageBatchCommand,
} from '@aws-sdk/client-sqs'
import { User, UserMessage } from '../types'

let _client: SQSClient | null

export const getClient = () => {
  if (!_client) {
    _client = new SQSClient({})
  }
  return _client
}

export const getAllUsers = async () => {
  const getUsersCommand = new ReceiveMessageCommand({
    QueueUrl: process.env.USER_QUEUE_URL,
  })
  const allMessages = await getAllMessages(getUsersCommand)

  return allMessages.map((m) => ({
    receiptHandle: m.ReceiptHandle as string,
    user: JSON.parse(m.Body ?? '{}') as User,
  }))
}
export const saveAllUsers = async (users: UserMessage[]) => {
  const toSave: SendMessageBatchCommand[] = []
  const toDelete: DeleteMessageBatchCommand[] = []
  for (let i = 0; i < users.length; i += 10) {
    // save
    const saveCmd = new SendMessageBatchCommand({
      QueueUrl: process.env.USER_QUEUE_URL,
      Entries: users.slice(i, i + 10).map((u) => ({
        Id: u.user.id,
        MessageBody: JSON.stringify(u),
      })),
    })
    toSave.push(saveCmd)
    // delete
    const deleteCmd = new DeleteMessageBatchCommand({
      QueueUrl: process.env.USER_QUEUE_URL,
      Entries: users
        .slice(i, i + 10)
        .filter((u) => !!u.receiptHandle)
        .map((u) => ({
          Id: u.user.id,
          ReceiptHandle: u.receiptHandle,
        })),
    })
    if (deleteCmd.input.Entries?.length) {
      toDelete.push(deleteCmd)
    }
  }
  await Promise.all([sendMessages(toSave), deleteMessages(toDelete)])
}

export const getAllMessages = async (getMessageCommand: ReceiveMessageCommand) => {
  const client = getClient()
  const allMessages: Message[] = []
  let lastMessage = null
  do {
    const receivedMessages = await client.send(getMessageCommand)
    const nextMessages = receivedMessages.Messages ?? []
    allMessages.push(...nextMessages)
    lastMessage = nextMessages[nextMessages.length - 1]
  } while (!!lastMessage)
  return allMessages
}

export const sendMessages = async (sendMessagesCommands: SendMessageBatchCommand[]) => {
  const client = getClient()
  for (const command of sendMessagesCommands) {
    const result = await client.send(command)
    if (result.Failed?.length) {
      throw result.Failed
    }
  }
}

export const deleteMessages = async (sendMessagesCommands: DeleteMessageBatchCommand[]) => {
  const client = getClient()
  for (const command of sendMessagesCommands) {
    const result = await client.send(command)
    if (result.Failed?.length) {
      throw result.Failed
    }
  }
}

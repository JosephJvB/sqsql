import {
  SQSClient,
  ReceiveMessageCommand,
  Message,
  SendMessageBatchCommand,
  DeleteMessageBatchCommand,
} from '@aws-sdk/client-sqs'
import { v4 as uuidv4 } from 'uuid'
import { User } from '../types'

let _client: SQSClient | null

export const getClient = () => {
  if (!_client) {
    _client = new SQSClient({})
  }
  return _client
}

export const getUserMessages = async () => {
  const getUsersCommand = new ReceiveMessageCommand({
    QueueUrl: process.env.USER_QUEUE_URL,
    MaxNumberOfMessages: 10,
  })

  const messages = await getAllMessages(getUsersCommand)
  console.log('getUserMessages', messages.length)

  return messages
}

export const clearUserMessages = async (messages: Message[]) => {
  console.log('clearUserMessages', messages.length)
  const toDelete: DeleteMessageBatchCommand[] = []
  for (let i = 0; i < messages.length; i += 10) {
    toDelete.push(
      new DeleteMessageBatchCommand({
        QueueUrl: process.env.USER_QUEUE_URL,
        Entries: messages.slice(i, i + 10).map((m) => ({
          Id: m.MessageId,
          ReceiptHandle: m.ReceiptHandle,
        })),
      }),
    )
  }
  await deleteMessages(toDelete)
}

export const sendUserMessages = async (users: User[]) => {
  console.log('sendUserMessages', users.length)
  const toSave: SendMessageBatchCommand[] = []
  for (let i = 0; i < users.length; i += 10) {
    // save
    const saveCmd = new SendMessageBatchCommand({
      QueueUrl: process.env.USER_QUEUE_URL,
      Entries: users.slice(i, i + 10).map((u) => {
        return {
          Id: uuidv4(),
          MessageBody: JSON.stringify(u),
        }
      }),
    })
    toSave.push(saveCmd)
  }
  await sendMessages(toSave)
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

import { APIGatewayProxyEvent } from 'aws-lambda'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'OPTIONS' | 'DELETE'

export interface HttpAPIEvent extends APIGatewayProxyEvent {
  httpMethod: HttpMethod
}

export const CORSHeaders = {
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Method': '*',
  'Access-Control-Allow-Origin': '*',
}
export const DefaultHeaders = {
  'Content-Type': 'application-javascript',
  ...CORSHeaders,
}

export interface User {
  id: string
  username: string
  email: string
}
export interface UserMessage {
  user: User
  receiptHandle: string
}

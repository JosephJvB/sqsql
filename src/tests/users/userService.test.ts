import { APIGatewayProxyResult } from 'aws-lambda'
import { lambdaHandler } from '../../users/userService'
import { getAPIEvent } from '../helpers'

import { getAllUsers, saveAllUsers } from '../../clients/sqs'

jest.mock('../../clients/sqs', () => {
  return {
    getAllUsers: jest.fn(async () => []),
    saveAllUsers: jest.fn(async () => null),
  }
})

const mockedGetUsers = getAllUsers as jest.Mock
const mockedSaveUsers = saveAllUsers as jest.Mock

describe('UserService.ts', function () {
  it('returns all users', async () => {
    const event = getAPIEvent('/users', 'GET', {}, {})
    const result: APIGatewayProxyResult = await lambdaHandler(event)

    expect(result.statusCode).toEqual(200)
    expect(result.body).toEqual(JSON.stringify([]))
  })
})

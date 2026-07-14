import type { Payload } from 'payload'
import { getTestPayload } from '../helpers/payload'

import { beforeAll, describe, expect, it } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
    expect(Array.isArray(users.docs)).toBe(true)
  })
})

import config from '@/payload.config'
import { getPayload, type Payload } from 'payload'

let payloadPromise: Promise<Payload> | undefined

export const getTestPayload = (): Promise<Payload> => {
  payloadPromise ??= config.then((payloadConfig) => getPayload({ config: payloadConfig }))
  return payloadPromise
}

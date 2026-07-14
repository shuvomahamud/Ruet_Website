import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import { communicationPreferencesSchema } from '@/communications/schema'

export async function PATCH(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to manage preferences.' }, { status: 401 })
  const input = communicationPreferencesSchema.safeParse(await request.json())
  if (!input.success) {
    return Response.json({ message: 'Check the communication preference values.' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'users',
      data: { communicationPreferences: input.data },
      id: user.id,
      overrideAccess: false,
      user,
    })
    return Response.json({ message: 'Communication preferences saved.' })
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : 'Preferences could not be saved.' },
      { status: 400 },
    )
  }
}


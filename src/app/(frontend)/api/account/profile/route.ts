import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import { profileSchema } from '@/auth/schemas'

export async function PATCH(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })

  const input = profileSchema.safeParse(await request.json())
  if (!input.success) {
    return Response.json(
      { issues: input.error.flatten().fieldErrors, message: 'Check the highlighted fields.' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'users',
      data: input.data,
      id: user.id,
      overrideAccess: false,
      user,
    })

    return Response.json({ message: 'Profile saved.', profileStatus: updated.profileStatus })
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : 'Profile could not be saved.' },
      { status: 400 },
    )
  }
}

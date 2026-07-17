import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'
import { z } from 'zod'

import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { getCancellationEligibility } from '@/services/admin-bulk-actions'

const schema = z.object({ ids: z.array(z.coerce.number().int().positive()).min(1).max(100) })
export async function POST(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (!isAdmin(user)) return Response.json({ message: 'Administrator access is required.' }, { status: 403 })
  const input = schema.safeParse(await request.json())
  if (!input.success) return Response.json({ message: 'Select between 1 and 100 memberships.' }, { status: 400 })
  const payload = await getPayload({ config })
  const cancellation = await getCancellationEligibility(await createLocalReq({ user }, payload), input.data.ids)
  return Response.json({ cancellation })
}

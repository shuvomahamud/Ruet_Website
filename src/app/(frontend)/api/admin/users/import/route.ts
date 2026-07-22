import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { importUsersFromCSV, USER_IMPORT_MAX_BYTES } from '@/services/user-import'

export async function POST(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (!isAdmin(user))
    return Response.json({ message: 'Administrator access is required.' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.csv'))
    return Response.json({ message: 'Choose a CSV file.' }, { status: 400 })
  if (file.size > USER_IMPORT_MAX_BYTES)
    return Response.json({ message: 'The CSV cannot exceed 2 MB.' }, { status: 413 })

  const payload = await getPayload({ config })
  const req = await createLocalReq({ user }, payload)
  const result = await importUsersFromCSV(req, await file.text())
  return Response.json({
    ...result,
    message: `${result.importedCount} user(s) imported; ${result.skippedCount} row(s) not imported.`,
  })
}

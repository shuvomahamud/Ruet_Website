import { createUserImportTemplate } from '@/services/user-import'
import { isAdmin } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'

export async function GET(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (!isAdmin(user))
    return Response.json({ message: 'Administrator access is required.' }, { status: 403 })

  return new Response(createUserImportTemplate(), {
    headers: {
      'content-disposition': 'attachment; filename="ruetian-usa-user-import-template.csv"',
      'content-type': 'text/csv; charset=utf-8',
    },
  })
}

import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.count({ collection: 'pages', overrideAccess: true })
    return Response.json(
      { status: 'ok' },
      { headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } },
    )
  } catch (error) {
    console.error('Health check failed.', error)
    return Response.json(
      { status: 'unavailable' },
      { headers: { 'Cache-Control': 'no-store' }, status: 503 },
    )
  }
}

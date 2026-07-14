import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import {
  getReportingData,
  parseReportFilters,
  reportingDataToCSV,
} from '@/services/reporting'
import { AppError } from '@/utilities/errors'

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request.headers)
    if (!user) {
      return Response.json({ message: 'Sign in to export reports.' }, { status: 401 })
    }
    const payload = await getPayload({ config })
    const data = await getReportingData({
      filters: parseReportFilters(new URL(request.url)),
      payload,
      user,
    })
    return new Response(reportingDataToCSV(data), {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': 'attachment; filename="ruetian-usa-operational-report.csv"',
        'Content-Type': 'text/csv; charset=utf-8',
      },
    })
  } catch (error) {
    return Response.json(
      { message: error instanceof AppError ? error.message : 'The report could not be exported.' },
      { status: error instanceof AppError ? error.status : 500 },
    )
  }
}

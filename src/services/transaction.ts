import { commitTransaction, initTransaction, killTransaction, type PayloadRequest } from 'payload'
import { sql } from '@payloadcms/db-postgres'

type LockableTable =
  | 'chapter_requests'
  | 'event_registrations'
  | 'memberships'
  | 'orders'
  | 'payments'
  | 'waitlist_entries'

const lockQueries: Record<LockableTable, (id: number | string) => ReturnType<typeof sql>> = {
  chapter_requests: (id) => sql`SELECT id FROM "chapter_requests" WHERE id = ${id} FOR UPDATE`,
  event_registrations: (id) =>
    sql`SELECT id FROM "event_registrations" WHERE id = ${id} FOR UPDATE`,
  memberships: (id) => sql`SELECT id FROM "memberships" WHERE id = ${id} FOR UPDATE`,
  orders: (id) => sql`SELECT id FROM "orders" WHERE id = ${id} FOR UPDATE`,
  payments: (id) => sql`SELECT id FROM "payments" WHERE id = ${id} FOR UPDATE`,
  waitlist_entries: (id) => sql`SELECT id FROM "waitlist_entries" WHERE id = ${id} FOR UPDATE`,
}

export const lockWorkflowRecord = async (
  req: PayloadRequest,
  table: LockableTable,
  id: number | string,
): Promise<void> => {
  const transactionID = await req.transactionID
  const sessions = req.payload.db.sessions as
    | Record<
        string,
        {
          db: { execute: (query: ReturnType<typeof sql>) => Promise<unknown> }
        }
      >
    | undefined
  const session = transactionID ? sessions?.[String(transactionID)] : undefined

  if (!session) {
    throw new Error('A workflow row lock requires an active database transaction.')
  }

  await session.db.execute(lockQueries[table](id))
}

export const runInTransaction = async <T>(
  req: PayloadRequest,
  operation: () => Promise<T>,
): Promise<T> => {
  const ownsTransaction = await initTransaction(req)

  try {
    const result = await operation()

    if (ownsTransaction) {
      await commitTransaction(req)
    }

    return result
  } catch (error) {
    if (ownsTransaction) {
      await killTransaction(req)
    }
    throw error
  }
}

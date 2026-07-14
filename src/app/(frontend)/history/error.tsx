'use client'

import { ErrorState } from '@/components/content/ErrorState'

export default function HistoryError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page-section">
      <ErrorState
        description="The history archive could not be loaded."
        reset={reset}
        title="History is temporarily unavailable"
      />
    </main>
  )
}

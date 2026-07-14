'use client'

import { ErrorState } from '@/components/content/ErrorState'

export default function CommitteesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page-section">
      <ErrorState
        description="Committee records could not be loaded."
        reset={reset}
        title="Leadership information is temporarily unavailable"
      />
    </main>
  )
}

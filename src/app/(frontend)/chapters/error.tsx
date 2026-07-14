'use client'

import { ErrorState } from '@/components/content/ErrorState'

export default function ChaptersError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page-section">
      <ErrorState
        description="Chapter information could not be loaded."
        reset={reset}
        title="Chapters are temporarily unavailable"
      />
    </main>
  )
}

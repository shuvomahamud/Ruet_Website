'use client'

import { ErrorState } from '@/components/content/ErrorState'
import { Container } from '@/components/ui/Container'

export default function LearningError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="page-section">
      <Container>
        <ErrorState description="Learning content could not be loaded." reset={reset} />
      </Container>
    </main>
  )
}

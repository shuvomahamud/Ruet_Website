import { LoadingSkeleton } from '@/components/content/LoadingSkeleton'
import { Container } from '@/components/ui/Container'

export default function LearningLoading() {
  return (
    <main className="page-section">
      <Container>
        <LoadingSkeleton />
      </Container>
    </main>
  )
}

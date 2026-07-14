import { LoadingSkeleton } from '@/components/content/LoadingSkeleton'
import { Container } from '@/components/ui/Container'

export default function CommitteesLoading() {
  return (
    <main className="page-section">
      <Container>
        <LoadingSkeleton cards={4} />
      </Container>
    </main>
  )
}

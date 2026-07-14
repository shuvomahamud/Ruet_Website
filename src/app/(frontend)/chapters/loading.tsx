import { LoadingSkeleton } from '@/components/content/LoadingSkeleton'
import { Container } from '@/components/ui/Container'

export default function ChaptersLoading() {
  return (
    <main className="page-section">
      <Container>
        <LoadingSkeleton cards={6} />
      </Container>
    </main>
  )
}

import { Container } from '@/components/ui/Container'

export const StatsStrip = ({
  items,
  label = 'By the numbers',
}: {
  items: Array<{ label: string; value: string }>
  label?: string
}) => (
  <section aria-label={label} className="stats-strip">
    <Container>
      <dl>
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`}>
            <dd>{item.value}</dd>
            <dt>{item.label}</dt>
          </div>
        ))}
      </dl>
    </Container>
  </section>
)

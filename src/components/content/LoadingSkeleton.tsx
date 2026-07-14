export const LoadingSkeleton = ({ cards = 6 }: { cards?: number }) => (
  <div aria-busy="true" aria-label="Loading content" className="skeleton-grid">
    {Array.from({ length: cards }, (_, index) => (
      <div aria-hidden="true" className="skeleton-card" key={index}>
        <span />
        <span />
        <span />
      </div>
    ))}
  </div>
)

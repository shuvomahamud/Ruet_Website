export default function MembershipLoading() {
  return (
    <main className="page-section">
      <div className="container">
        <div aria-label="Loading membership" className="skeleton-grid" role="status">
          {[0, 1, 2].map((item) => (
            <div className="skeleton-card" key={item}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

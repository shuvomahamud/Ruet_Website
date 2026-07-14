'use client'

export default function MembershipError({ reset }: { reset: () => void }) {
  return (
    <main className="page-section">
      <div className="container">
        <div className="error-state">
          <h2>Membership information is temporarily unavailable</h2>
          <p>Your account and payment records were not changed. Try loading the page again.</p>
          <button className="button button--primary" onClick={reset} type="button">
            Try again
          </button>
        </div>
      </div>
    </main>
  )
}

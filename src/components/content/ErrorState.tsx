'use client'

export const ErrorState = ({
  description = 'Please try again.',
  reset,
  title = 'Something went wrong',
}: {
  description?: string
  reset?: () => void
  title?: string
}) => (
  <div className="error-state" role="alert">
    <h2>{title}</h2>
    <p>{description}</p>
    {reset ? (
      <button className="button button--secondary" onClick={reset} type="button">
        Try again
      </button>
    ) : null}
  </div>
)

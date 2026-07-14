import Link from 'next/link'

export const EmptyState = ({
  actionHref,
  actionLabel,
  description,
  title,
}: {
  actionHref?: string
  actionLabel?: string
  description: string
  title: string
}) => (
  <div className="empty-state">
    <span aria-hidden="true">◇</span>
    <h2>{title}</h2>
    <p>{description}</p>
    {actionHref && actionLabel ? (
      <Link className="button button--secondary" href={actionHref}>
        {actionLabel}
      </Link>
    ) : null}
  </div>
)

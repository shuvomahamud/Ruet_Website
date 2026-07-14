import Link from 'next/link'

const pageHref = (basePath: string, params: URLSearchParams, page: number) => {
  const next = new URLSearchParams(params)
  if (page <= 1) next.delete('page')
  else next.set('page', String(page))
  const query = next.toString()
  return `${basePath}${query ? `?${query}` : ''}`
}

export const Pagination = ({
  basePath,
  page,
  query,
  totalPages,
}: {
  basePath: string
  page: number
  query: URLSearchParams
  totalPages: number
}) => {
  if (totalPages <= 1) return null
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index)

  return (
    <nav aria-label="Pagination" className="pagination">
      {page > 1 ? (
        <Link href={pageHref(basePath, query, page - 1)} rel="prev">
          Previous
        </Link>
      ) : (
        <span aria-disabled="true">Previous</span>
      )}
      {pages.map((value) => (
        <Link
          aria-current={value === page ? 'page' : undefined}
          href={pageHref(basePath, query, value)}
          key={value}
        >
          {value}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={pageHref(basePath, query, page + 1)} rel="next">
          Next
        </Link>
      ) : (
        <span aria-disabled="true">Next</span>
      )}
    </nav>
  )
}

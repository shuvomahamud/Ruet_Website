import type { ReactNode } from 'react'

export const FilterBar = ({
  children,
  label = 'Filter content',
}: {
  children: ReactNode
  label?: string
}) => (
  <div aria-label={label} className="filter-bar" role="search">
    {children}
  </div>
)

import type { ReactNode } from 'react'

export const Badge = ({
  children,
  tone = 'blue',
}: {
  children: ReactNode
  tone?: 'blue' | 'gold' | 'green' | 'red'
}) => <span className={`badge badge--${tone}`}>{children}</span>

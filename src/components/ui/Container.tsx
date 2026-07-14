import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  narrow?: boolean
}

export const Container = ({ children, narrow = false }: Props) => (
  <div className={narrow ? 'container container--narrow' : 'container'}>{children}</div>
)

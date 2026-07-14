import type { ReactNode } from 'react'

export const ContentRail = ({ children, label }: { children: ReactNode; label: string }) => (
  <div aria-label={label} className="content-rail">
    {children}
  </div>
)

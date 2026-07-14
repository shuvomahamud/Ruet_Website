import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Container } from '@/components/ui/Container'

export const AuthPage = ({
  children,
  description,
  eyebrow = 'Member account',
  title,
}: {
  children: ReactNode
  description: string
  eyebrow?: string
  title: string
}) => (
  <>
    <SiteHeader />
    <main className="auth-page">
      <Container>
        <div className="auth-page__layout">
          <div className="auth-page__intro">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="auth-card">{children}</div>
        </div>
      </Container>
    </main>
    <SiteFooter />
  </>
)

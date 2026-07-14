import type { Metadata } from 'next'
import { IBM_Plex_Sans, Source_Serif_4 } from 'next/font/google'
import type { ReactNode } from 'react'

import { env } from '@/utilities/env'

import './styles.css'

const primarySans = IBM_Plex_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
})

const editorialSerif = Source_Serif_4({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  description:
    'RUETIAN USA connects RUET alumni across the United States through membership, chapters, events, and professional learning.',
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'RUETIAN USA',
    template: '%s | RUETIAN USA',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${primarySans.variable} ${editorialSerif.variable}`}
      data-scroll-behavior="smooth"
      lang="en"
    >
      <body>{children}</body>
    </html>
  )
}

import Link from 'next/link'

import { getRole } from '@/access/roles'
import type { User } from '@/payload-types'

const memberLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/membership/status', label: 'Membership' },
  { href: '/account/payments', label: 'Payments' },
  { href: '/events/registrations', label: 'Registrations' },
  { href: '/communications/preferences', label: 'Preferences' },
  { href: '/account/settings', label: 'Profile & security' },
]

export const AccountNavigation = ({ user }: { user: User }) => {
  const elevated = ['chapterAdmin', 'admin', 'superAdmin'].includes(getRole(user) ?? '')
  return (
    <nav aria-label="Account navigation" className="account-navigation">
      {memberLinks.map((item) => (
        <Link href={item.href} key={item.href}>
          {item.label}
        </Link>
      ))}
      {elevated ? <Link href="/reports">Reports</Link> : null}
      {elevated ? <Link href="/payments/review">Payment review</Link> : null}
    </nav>
  )
}


'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react'

import type { Header } from '@/payload-types'

type NavigationItem = NonNullable<Header['mainLinks']>[number]

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

export const PrimaryNavigation = ({
  ctaHref,
  ctaLabel,
  items,
}: {
  ctaHref: string
  ctaLabel: string
  items: NavigationItem[]
}) => {
  const pathname = usePathname()
  const menuID = useId()
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const desktopTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const drawerRef = useRef<HTMLDivElement>(null)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)

  const closeMobile = () => {
    setMobileOpen(false)
    requestAnimationFrame(() => mobileTriggerRef.current?.focus())
  }

  useEffect(() => {
    if (!mobileOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => {
      drawerRef.current?.querySelector<HTMLElement>('a, button, summary')?.focus()
    })
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [mobileOpen])

  const handleDrawerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMobile()
      return
    }
    if (event.key !== 'Tab') return

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ),
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || !desktopOpen) return
      const closing = desktopOpen
      setDesktopOpen(null)
      desktopTriggerRefs.current[closing]?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [desktopOpen])

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="primary-navigation primary-navigation--desktop"
      >
        <ul>
          {items.map((item) => {
            const href = item.link.href
            const key = `${item.link.label}-${href}`
            const children = item.children ?? []
            const open = desktopOpen === key
            const panelID = `${menuID}-${href.replace(/[^a-z0-9]/gi, '-')}`

            return (
              <li
                className="primary-navigation__item"
                key={key}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setDesktopOpen(null)
                }}
                onMouseEnter={() => children.length && setDesktopOpen(key)}
                onMouseLeave={() => setDesktopOpen(null)}
              >
                {children.length ? (
                  <button
                    aria-expanded={open}
                    aria-controls={panelID}
                    className={isActive(pathname, href) ? 'is-active' : undefined}
                    onClick={() => setDesktopOpen(open ? null : key)}
                    ref={(node) => {
                      desktopTriggerRefs.current[key] = node
                    }}
                    type="button"
                  >
                    {item.link.label}
                    <span aria-hidden="true">⌄</span>
                  </button>
                ) : (
                  <Link
                    aria-current={isActive(pathname, href) ? 'page' : undefined}
                    href={href}
                    onClick={() => setDesktopOpen(null)}
                  >
                    {item.link.label}
                  </Link>
                )}

                {children.length && open ? (
                  <div className="mega-menu" id={panelID}>
                    <div className="mega-menu__links">
                      <Link
                        className="mega-menu__overview"
                        href={href}
                        onClick={() => setDesktopOpen(null)}
                      >
                        <strong>{item.link.label} overview</strong>
                        {item.link.description ? <span>{item.link.description}</span> : null}
                      </Link>
                      {children.map((child) => (
                        <Link
                          href={child.link.href}
                          key={`${child.link.label}-${child.link.href}`}
                          onClick={() => setDesktopOpen(null)}
                        >
                          <strong>{child.link.label}</strong>
                          {child.link.description ? <span>{child.link.description}</span> : null}
                        </Link>
                      ))}
                    </div>
                    {item.featured?.title ? (
                      <aside className="mega-menu__featured">
                        {item.featured.eyebrow ? <span>{item.featured.eyebrow}</span> : null}
                        <strong>{item.featured.title}</strong>
                        {item.featured.description ? <p>{item.featured.description}</p> : null}
                        {item.featured.href && item.featured.label ? (
                          <Link href={item.featured.href} onClick={() => setDesktopOpen(null)}>
                            {item.featured.label} →
                          </Link>
                        ) : null}
                      </aside>
                    ) : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </nav>

      <button
        aria-controls={`${menuID}-mobile`}
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className="mobile-menu-trigger"
        onClick={() => setMobileOpen((value) => !value)}
        ref={mobileTriggerRef}
        type="button"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {mobileOpen ? (
        <div className="mobile-navigation-shell">
          <button
            aria-label="Close navigation menu"
            className="mobile-navigation__backdrop"
            onClick={closeMobile}
            type="button"
          />
          <div
            aria-label="Mobile navigation"
            aria-modal="true"
            className="mobile-navigation"
            id={`${menuID}-mobile`}
            onKeyDown={handleDrawerKeyDown}
            ref={drawerRef}
            role="dialog"
          >
            <div className="mobile-navigation__heading">
              <strong>Explore RUETIAN USA</strong>
              <button aria-label="Close navigation menu" onClick={closeMobile} type="button">
                ×
              </button>
            </div>
            <nav aria-label="Mobile primary navigation">
              {items.map((item) =>
                item.children?.length ? (
                  <details key={`${item.link.label}-${item.link.href}`}>
                    <summary>{item.link.label}</summary>
                    <Link href={item.link.href} onClick={closeMobile}>
                      {item.link.label} overview
                    </Link>
                    {item.children.map((child) => (
                      <Link
                        href={child.link.href}
                        key={`${child.link.label}-${child.link.href}`}
                        onClick={closeMobile}
                      >
                        {child.link.label}
                      </Link>
                    ))}
                  </details>
                ) : (
                  <Link
                    key={`${item.link.label}-${item.link.href}`}
                    href={item.link.href}
                    onClick={closeMobile}
                  >
                    {item.link.label}
                  </Link>
                ),
              )}
            </nav>
            <Link className="button button--primary" href={ctaHref} onClick={closeMobile}>
              {ctaLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  )
}

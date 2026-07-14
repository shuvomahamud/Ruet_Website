import Link from 'next/link'

import type { Announcement, Chapter } from '@/payload-types'

import { Badge } from '../ui/Badge'

const tone = (value: Announcement['tone']) =>
  value === 'alert' ? 'red' : value === 'success' ? 'green' : 'blue'

export const AnnouncementFeed = ({
  announcements,
  emptyMessage,
}: {
  announcements: Announcement[]
  emptyMessage?: string
}) => {
  if (!announcements.length) {
    return emptyMessage ? <p className="empty-inline">{emptyMessage}</p> : null
  }

  return (
    <div className="card-grid card-grid--compact announcement-feed">
      {announcements.map((announcement) => {
        const chapter =
          typeof announcement.chapter === 'object'
            ? (announcement.chapter as Chapter)
            : undefined
        return (
          <article className="surface-card announcement-card" key={announcement.id}>
            <div className="announcement-card__badges">
              <Badge tone={tone(announcement.tone)}>{announcement.tone || 'info'}</Badge>
              <Badge tone={announcement.audience === 'members' ? 'gold' : 'blue'}>
                {announcement.audience === 'members' ? 'Members' : 'Public'}
              </Badge>
            </div>
            <p className="surface-card__label">{chapter?.name ?? 'RUETIAN USA'}</p>
            <h3>{announcement.title}</h3>
            <p>{announcement.summary}</p>
            {announcement.details ? <p>{announcement.details}</p> : null}
            {announcement.ctaHref && announcement.ctaLabel ? (
              <Link className="surface-card__link" href={announcement.ctaHref}>
                {announcement.ctaLabel}
              </Link>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

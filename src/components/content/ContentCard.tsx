import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'

export const ContentCard = ({
  badge,
  description,
  href,
  image,
  meta,
  title,
}: {
  badge?: string
  description: string
  href: string
  image?: { alt: string; height?: number | null; url: string; width?: number | null }
  meta?: string
  title: string
}) => (
  <article className="content-card">
    {image ? (
      <div className="content-card__image">
        <Image
          alt={image.alt}
          height={image.height || 720}
          src={image.url}
          width={image.width || 1200}
        />
      </div>
    ) : null}
    <div className="content-card__body">
      {badge ? <Badge>{badge}</Badge> : null}
      {meta ? <p className="content-card__meta">{meta}</p> : null}
      <h3>
        <Link href={href}>{title}</Link>
      </h3>
      <p>{description}</p>
      <Link className="content-card__link" href={href}>
        Read more <span aria-hidden="true">→</span>
      </Link>
    </div>
  </article>
)

import Image from 'next/image'

export const Gallery = ({
  images,
  label = 'Image gallery',
}: {
  images: Array<{
    alt: string
    height?: number | null
    id: number | string
    url: string
    width?: number | null
  }>
  label?: string
}) => {
  if (!images.length) return null
  return (
    <div aria-label={label} className="gallery-grid">
      {images.map((item) => (
        <figure key={item.id}>
          <Image
            alt={item.alt}
            height={item.height || 800}
            src={item.url}
            width={item.width || 1200}
          />
        </figure>
      ))}
    </div>
  )
}

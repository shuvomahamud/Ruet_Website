import { access } from 'fs/promises'
import path from 'path'

const logoCandidates = [
  '/brand/ruetian-usa-logo.svg',
  '/brand/ruetian-usa-logo.png',
  '/brand/ruetian-usa-logo.webp',
  '/brand/ruetian-usa-logo.jpg',
  '/brand/ruetian-usa-logo.jpeg',
]

export const getSiteLogoPath = async (): Promise<string | null> => {
  for (const candidate of logoCandidates) {
    const assetPath = path.join(process.cwd(), 'public', candidate)

    try {
      await access(assetPath)
      return candidate
    } catch {
      continue
    }
  }

  return null
}


import { describe, expect, it, vi } from 'vitest'

import { validateHomeAdvertisement } from '@/hooks/validateHomeAdvertisement'

type HookArguments = Parameters<typeof validateHomeAdvertisement>[0]

const runValidation = (data: Record<string, unknown>, query = '') =>
  validateHomeAdvertisement({
    data,
    req: {
      payload: {
        findByID: vi.fn(),
      },
      searchParams: new URLSearchParams(query),
    },
  } as unknown as HookArguments)

describe('home advertisement validation', () => {
  it('allows incomplete advertisement content during autosave', async () => {
    const data = {
      _status: 'published',
      heroAdvertisement: {
        enabled: true,
        type: 'video',
      },
    }

    await expect(runValidation(data, 'autosave=true')).resolves.toBe(data)
  })

  it('allows incomplete advertisement content in a saved draft', async () => {
    const data = {
      _status: 'draft',
      heroAdvertisement: {
        enabled: true,
        type: 'text',
      },
    }

    await expect(runValidation(data)).resolves.toBe(data)
  })

  it('requires the selected advertisement content when publishing', async () => {
    const data = {
      _status: 'published',
      heroAdvertisement: {
        enabled: true,
        type: 'text',
      },
    }

    await expect(runValidation(data)).rejects.toMatchObject({
      code: 'ADVERTISEMENT_CONTENT_REQUIRED',
      message: 'A text advertisement needs a headline or body.',
    })
  })
})

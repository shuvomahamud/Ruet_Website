import type { CollectionBeforeChangeHook } from 'payload'

export const validateSingleActiveMembershipPlan: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const active = data.active ?? originalDoc?.active ?? false
  if (!active) return data
  const existing = await req.payload.find({
    collection: 'membershipPlans',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      and: [
        { active: { equals: true } },
        ...(operation === 'update' && originalDoc?.id
          ? [{ id: { not_equals: originalDoc.id } }]
          : []),
      ],
    },
  })

  if (existing.docs.length) {
    throw new Error('Only one membership plan can be active at a time. Deactivate it first.')
  }

  return data
}

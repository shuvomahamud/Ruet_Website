export const humanizeStatus = (value: string): string =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export const statusTone = (status: string): 'blue' | 'gold' | 'green' | 'red' => {
  if (['accepted', 'active', 'approved', 'confirmed', 'paid', 'sent'].includes(status)) {
    return 'green'
  }
  if (
    ['cancelled', 'cancelled_by_admin', 'expired', 'failed', 'failed_manual_payment', 'suspended'].includes(
      status,
    )
  ) {
    return 'red'
  }
  if (
    [
      'grace_period',
      'pending',
      'pending_manual_approval',
      'pending_payment',
      'promoted',
      'waiting',
    ].includes(status)
  ) {
    return 'gold'
  }
  return 'blue'
}


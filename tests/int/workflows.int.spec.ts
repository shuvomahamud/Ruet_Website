import { describe, expect, it } from 'vitest'

import { assertExpectedStatus, assertWorkflowTransition } from '@/domain/workflows'
import { normalizeRollNumberValue } from '@/hooks/normalizeRollNumber'

describe('workflow state machines', () => {
  it('accepts legal and idempotent transitions', () => {
    expect(() => assertWorkflowTransition('payment', 'pending', 'approved')).not.toThrow()
    expect(() => assertWorkflowTransition('payment', 'approved', 'approved')).not.toThrow()
    expect(() =>
      assertWorkflowTransition('membership', 'pending_manual_approval', 'active'),
    ).not.toThrow()
    expect(() => assertWorkflowTransition('waitlist', 'waiting', 'promoted')).not.toThrow()
  })

  it('rejects illegal and stale transitions', () => {
    expect(() => assertWorkflowTransition('payment', 'approved', 'failed')).toThrow(
      /Cannot transition payment/,
    )
    expect(() => assertWorkflowTransition('order', 'cancelled', 'paid')).toThrow(
      /Cannot transition order/,
    )
    expect(() => assertWorkflowTransition('registration', 'cancelled', 'confirmed')).toThrow(
      /Cannot transition registration/,
    )
    expect(() => assertExpectedStatus('active', 'pending_manual_approval')).toThrow(
      /record changed/i,
    )
  })
})

describe('roll number normalization', () => {
  it('preserves punctuation while removing whitespace and normalizing case', () => {
    expect(normalizeRollNumberValue('  12 a- 34 ')).toBe('12A-34')
    expect(normalizeRollNumberValue('   ')).toBeUndefined()
  })
})

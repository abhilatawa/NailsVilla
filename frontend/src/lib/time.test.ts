import { describe, expect, it } from 'vitest'
import { cancellationDeadline } from '@/lib/time'

describe('cancellationDeadline', () => {
  it('is the given number of hours before the appointment starts', () => {
    expect(cancellationDeadline('2026-10-15', '14:30', 4)).toEqual(new Date(2026, 9, 15, 10, 30))
  })

  it('rolls back to the previous day for early-morning appointments', () => {
    expect(cancellationDeadline('2026-10-15', '02:00', 4)).toEqual(new Date(2026, 9, 14, 22, 0))
  })
})

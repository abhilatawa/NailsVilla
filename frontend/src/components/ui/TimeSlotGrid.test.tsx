import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TimeSlotGrid } from '@/components/ui/TimeSlotGrid'

describe('TimeSlotGrid', () => {
  const slots = [
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM', disabled: true },
  ]

  it('greys out booked slots and does not let them be selected', async () => {
    const onSelect = vi.fn()
    render(<TimeSlotGrid slots={slots} selected={null} onSelect={onSelect} />)

    const booked = screen.getByRole('button', { name: /10:00 AM, already booked/ })
    expect(booked).toBeDisabled()
    await userEvent.click(booked)
    expect(onSelect).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: '9:00 AM' }))
    expect(onSelect).toHaveBeenCalledWith('09:00')
  })
})

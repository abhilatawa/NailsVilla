import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders its label and responds to clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Book an Appointment</Button>)

    const button = screen.getByRole('button', { name: 'Book an Appointment' })
    await userEvent.click(button)

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders as a child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/book">Book an Appointment</a>
      </Button>,
    )

    expect(screen.getByRole('link', { name: 'Book an Appointment' })).toHaveAttribute(
      'href',
      '/book',
    )
  })
})

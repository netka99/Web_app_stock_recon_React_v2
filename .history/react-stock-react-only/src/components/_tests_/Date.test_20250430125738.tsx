import React from 'react'
import { DatePicker } from '../index'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
// import userEvent from '@testing-library/user-event'

describe('Date Component', () => {
  it('renders the date on the screen', () => {
    render(<DatePicker todaysDate="2025-01-01" setTodaysDate={() => {}} />)
    const dateInput = screen.getByTestId('datepicker')
    expect(dateInput).toHaveValue('2025-01-01')
  })
  it('selecting new date', async () => {
    const handleChange = vi.fn()
    render(<DatePicker todaysDate="2025-01-01" setTodaysDate={handleChange} />)
    const input = screen.getByTestId('datepicker')
    await fireEvent.change(input, { target: { value: '2025-04-16' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveValue('2025-04-15')
  })
})

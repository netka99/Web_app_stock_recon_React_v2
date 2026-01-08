import React from 'react'
import { DatePicker } from '../index'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Date Component', () => {
  it('renders the date on the screen', () => {
    render(<DatePicker todaysDate="2025-01-01" setTodaysDate={() => {}} />)
    const dateInput = screen.getByTestId('datepicker')
    expect(dateInput).toHaveValue('2025-01-01')
  })
})

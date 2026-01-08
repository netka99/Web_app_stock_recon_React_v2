import { DatePicker } from '../index'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Date Component', () => {
  it('renders the date on the screen', () => {
    render(<DatePicker todaysDate="01/01/2025" setTodaysDate={() => {}} />)
    expect(screen.toBeInTheDocument())
  })
})

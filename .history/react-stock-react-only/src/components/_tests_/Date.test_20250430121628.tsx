import { DatePicker } from '../index'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

describe('Date Component', () => {
  it('renders the date on the screen', () => {
    render(<DatePicker todaysDate="01/01/2025" setTodaysDate="01/01/2025" />)
    expect(screen.toBeInTheDocument())
  })
})

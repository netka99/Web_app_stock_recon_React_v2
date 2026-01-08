import React from 'react'
import { AddShop } from '../index'
import { render, screen, userEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('Add Shop Name', () => {
  it('renders input with placeholder', () => {
    const mockOnAddShop = vi.fn()
    render(<AddShop onAddShop={mockOnAddShop} />)
    expect(screen.getByPlaceholderText('Dodaj Sklep')).toBeInTheDocument()
  })
  it('renders button with text', () => {
    const mockOnAddShop = vi.fn()
    render(<AddShop onAddShop={mockOnAddShop} />)
    expect(screen.getByText('Dodaj')).toBeInTheDocument()
  })
  it('updates input value on typing', () => {
    const mockOnAddShop = vi.fn()
    render(<AddShop onAddShop={mockOnAddShop} />)
    const input = screen.getByRole('input')
    userEvent.type(input, { target: { value: 'Noniewicza' } })
  })
})

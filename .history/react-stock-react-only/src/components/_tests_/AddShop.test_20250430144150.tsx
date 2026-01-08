import React from 'react'
import { AddShop } from '../index'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('Add Shop Name', () => {
  it('renders input with placeholder', () => {
    render(<AddShop onAddShop=()=>{"Noniewicza"} />)
    expect(screen.getByPlaceholderText('Dodaj Sklep')).toBeInTheDocument()
  })
})

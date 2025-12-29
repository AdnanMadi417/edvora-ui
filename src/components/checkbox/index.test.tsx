import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Checkbox from './index'

describe('Checkbox Component', () => {
  it('renders a checkbox input', () => {
    render(<Checkbox />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveAttribute('type', 'checkbox')
  })

  it('can be checked and unchecked', async () => {
    const user = userEvent.setup()
    render(<Checkbox />)
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    
    expect(checkbox.checked).toBe(false)
    
    await user.click(checkbox)
    expect(checkbox.checked).toBe(true)
    
    await user.click(checkbox)
    expect(checkbox.checked).toBe(false)
  })

  it('accepts an id prop', () => {
    render(<Checkbox id="test-checkbox" />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('id', 'test-checkbox')
  })

  it('applies custom className via extra prop', () => {
    render(<Checkbox extra="custom-class" />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-class')
  })

  it('applies color classes correctly', () => {
    const { rerender } = render(<Checkbox color="red" />)
    let checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('checked:bg-red-500')
    
    rerender(<Checkbox color="blue" />)
    checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('checked:bg-blue-500')
    
    rerender(<Checkbox color="green" />)
    checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('checked:bg-green-500')
  })

  it('uses default brand color when no color is specified', () => {
    render(<Checkbox />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('checked:bg-brand-500')
  })

  it('forwards additional props to the input element', () => {
    render(<Checkbox data-testid="custom-checkbox" disabled />)
    
    const checkbox = screen.getByTestId('custom-checkbox')
    expect(checkbox).toBeDisabled()
  })
})


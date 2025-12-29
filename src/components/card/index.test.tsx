import React from 'react'
import { render, screen } from '@testing-library/react'
import Card from './index'

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Test Content</div>
      </Card>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <Card>
        <div>First Child</div>
        <div>Second Child</div>
      </Card>
    )
    
    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
  })

  it('applies extra className', () => {
    const { container } = render(
      <Card extra="custom-class">
        <div>Content</div>
      </Card>
    )
    
    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })

  it('applies default shadow when default prop is true', () => {
    const { container } = render(
      <Card default>
        <div>Content</div>
      </Card>
    )
    
    const card = container.querySelector('.shadow-shadow-500')
    expect(card).toBeInTheDocument()
  })

  it('applies default shadow when default prop is false', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    )
    
    const card = container.querySelector('.shadow-shadow-100')
    expect(card).toBeInTheDocument()
  })

  it('forwards additional props', () => {
    const { container } = render(
      <Card data-testid="card-test" aria-label="Test Card">
        <div>Content</div>
      </Card>
    )
    
    const card = container.querySelector('[data-testid="card-test"]')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('aria-label', 'Test Card')
  })
})


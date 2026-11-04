import React from 'react'
import { render, screen } from '@testing-library/react'
import NavLink from 'components/ub/navigation/links/NavLink'

// Mock next/link is already handled in jest.setup.js
describe('NavLink Component', () => {
  it('renders children correctly', () => {
    render(
      <NavLink href="/test">
        <span>Test Link</span>
      </NavLink>
    )
    
    expect(screen.getByText('Test Link')).toBeInTheDocument()
  })

  it('applies href correctly', () => {
    render(
      <NavLink href="/dashboard">
        Dashboard
      </NavLink>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('applies className', () => {
    render(
      <NavLink href="/test" className="custom-link-class">
        Link Text
      </NavLink>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveClass('custom-link-class')
  })

  it('applies custom styles', () => {
    const customStyles = { color: 'red', fontSize: '16px' }
    render(
      <NavLink href="/test" styles={customStyles}>
        Link Text
      </NavLink>
    )
    
    const link = screen.getByRole('link')
    // Browser converts color names to RGB
    expect(link).toHaveStyle({ color: 'rgb(255, 0, 0)', fontSize: '16px' })
  })

  it('applies borderRadius', () => {
    render(
      <NavLink href="/test" borderRadius="8px">
        Link Text
      </NavLink>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveStyle({ borderRadius: '8px' })
  })

  it('merges styles and borderRadius correctly', () => {
    const customStyles = { color: 'blue' }
    render(
      <NavLink href="/test" styles={customStyles} borderRadius="10px">
        Link Text
      </NavLink>
    )
    
    const link = screen.getByRole('link')
    // Browser converts color names to RGB
    expect(link).toHaveStyle({ color: 'rgb(0, 0, 255)', borderRadius: '10px' })
  })

  it('forwards additional Next.js Link props', () => {
    render(
      <NavLink href="/test" prefetch={false} scroll={false}>
        Link Text
      </NavLink>
    )
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
  })

  it('handles complex children', () => {
    render(
      <NavLink href="/test">
        <div>
          <span>Icon</span>
          <span>Text</span>
        </div>
      </NavLink>
    )
    
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })
})


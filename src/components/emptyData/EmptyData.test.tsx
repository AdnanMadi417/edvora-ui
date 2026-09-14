import React from 'react'
import { render, screen } from '@testing-library/react'
import EmptyData from './EmptyData'

describe('EmptyData Component', () => {
  it('renders the empty data message', () => {
    render(<EmptyData />)
    
    expect(screen.getByText('No data found')).toBeInTheDocument()
    expect(screen.getByText('There is no data available at the moment')).toBeInTheDocument()
  })

  it('renders the default empty-state icon', () => {
    const { container } = render(<EmptyData />)

    // Default icon (SearchX) when no `icon` prop is passed — not the old
    // raster image.
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('has the correct structure', () => {
    const { container } = render(<EmptyData />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()

    const iconBadge = container.querySelector('.rounded-full')
    expect(iconBadge).toBeInTheDocument()
  })
})


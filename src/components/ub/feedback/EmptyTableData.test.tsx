import React from 'react'
import { render, screen } from '@testing-library/react'
import EmptyTableData from 'components/ub/feedback/EmptyTableData'

describe('EmptyTableData Component', () => {
  it('renders the empty data message', () => {
    render(<EmptyTableData />)
    
    expect(screen.getByText('No data found')).toBeInTheDocument()
    expect(screen.getByText('There is no data available at the moment')).toBeInTheDocument()
  })

  it('renders the default empty-state icon', () => {
    const { container } = render(<EmptyTableData />)

    // Default icon (SearchX) when no `icon` prop is passed — not the old
    // raster image, replaced since it read as a chat/notification icon
    // in some contexts where this component was reused.
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders a custom icon when provided', () => {
    const { container } = render(<EmptyTableData icon={<span data-testid="custom-icon" />} />)

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('has the correct structure without card styling', () => {
    const { container } = render(<EmptyTableData />)
    
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    
    // Should not have rounded-2xl border like EmptyData
    const card = container.querySelector('.rounded-2xl')
    expect(card).not.toBeInTheDocument()
  })
})


import React from 'react'
import { render, screen } from '@testing-library/react'
import EmptyTableData from './EmptyTableData'

describe('EmptyTableData Component', () => {
  it('renders the empty data message', () => {
    render(<EmptyTableData />)
    
    expect(screen.getByText('No data found')).toBeInTheDocument()
    expect(screen.getByText('There is no data available at the moment')).toBeInTheDocument()
  })

  it('renders the empty data icon', () => {
    render(<EmptyTableData />)
    
    const image = screen.getByAltText('No data')
    expect(image).toBeInTheDocument()
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


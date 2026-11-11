import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from 'components/ub/navigation/layout/Footer'

describe('Footer Component', () => {
  it('renders copyright text with current year', () => {
    render(<Footer />)
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`©${currentYear}`))).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
  })

  it('names Unibexs as plain text, not a link to nowhere', () => {
    render(<Footer />)

    expect(screen.getByText('Unibexs').tagName).toBe('SPAN')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

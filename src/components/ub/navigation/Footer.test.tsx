import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Footer from 'components/ub/navigation/Footer'

describe('Footer Component', () => {
  it('renders copyright text with current year', () => {
    render(<Footer />)
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`©${currentYear}`))).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
  })

  it('renders Unibexs link', () => {
    render(<Footer />)
    
    const link = screen.getByText('Unibexs')
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe('A')
  })

  it('has correct link href', () => {
    render(<Footer />)
    
    const link = screen.getByText('Unibexs')
    expect(link).toHaveAttribute('href', '#')
  })

  it('is keyboard reachable', async () => {
    const user = userEvent.setup()
    render(<Footer />)

    await user.tab()
    expect(screen.getByText('Unibexs')).toHaveFocus()
  })
})


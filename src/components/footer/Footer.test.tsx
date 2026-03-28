import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Footer from './Footer'

describe('Footer Component', () => {
  it('renders copyright text with current year', () => {
    render(<Footer />)
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`©${currentYear}`))).toBeInTheDocument()
    expect(screen.getByText(/All Rights Reserved/)).toBeInTheDocument()
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

  it('applies hover styles on mouse enter', async () => {
    const user = userEvent.setup()
    render(<Footer />)
    
    const link = screen.getByText('Unibexs')
    
    await user.hover(link)
    
    expect(link).toHaveStyle({
      textDecoration: 'line-through',
    })
  })

  it('removes hover styles on mouse leave', async () => {
    const user = userEvent.setup()
    render(<Footer />)
    
    const link = screen.getByText('Unibexs')
    
    await user.hover(link)
    expect(link).toHaveStyle({ textDecoration: 'line-through' })
    
    await user.unhover(link)
    expect(link).toHaveStyle({ textDecoration: 'none' })
  })

  it('has transition styles', () => {
    render(<Footer />)
    
    const link = screen.getByText('Unibexs')
    expect(link).toHaveStyle({
      transition: 'all 0.3s ease',
    })
  })
})


import React from 'react'
import { render, screen } from '@testing-library/react'
import Loading from './Loading'

describe('Loading Component', () => {
  it('renders with default props', () => {
    const { container } = render(<Loading />)
    
    // Check if the loading spinner is rendered (div with border style)
    const spinner = container.querySelector('div[style*="border"]')
    expect(spinner).toBeInTheDocument()
    
    // Check if default text is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<Loading text="Please wait..." />)
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('renders with custom size', () => {
    const { container } = render(<Loading size={100} />)
    
    const spinner = container.querySelector('div[style*="width: 100px"]')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveStyle({ width: '100px', height: '100px' })
  })

  it('renders with custom color', () => {
    const { container } = render(<Loading color="#ff0000" />)
    
    const spinner = container.querySelector('div[style*="border"]')
    expect(spinner).toBeInTheDocument()
    // Browser converts hex to RGB, so check for either format
    const borderStyle = spinner?.getAttribute('style') || ''
    expect(borderStyle).toMatch(/#ff0000|rgb\(255,\s*0,\s*0\)/i)
  })

  it('applies custom size and color together', () => {
    const { container } = render(<Loading size={75} color="#00ff00" />)
    
    const spinner = container.querySelector('div[style*="border"]')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveStyle({ 
      width: '75px',
      height: '75px',
    })
    // Browser converts hex to RGB, so check for either format
    const borderStyle = spinner?.getAttribute('style') || ''
    expect(borderStyle).toMatch(/#00ff00|rgb\(0,\s*255,\s*0\)/i)
  })

  it('renders without text when text prop is empty', () => {
    const { container } = render(<Loading text="" />)
    
    const spinner = container.querySelector('div[style*="border"]')
    expect(spinner).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
})


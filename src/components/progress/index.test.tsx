import React from 'react'
import { render, screen } from '@testing-library/react'
import Progress from './index'

describe('Progress Component', () => {
  it('renders with default props', () => {
    const { container } = render(<Progress value={50} />)
    
    const progressBar = container.querySelector('div[style*="width: 50%"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('applies correct width percentage', () => {
    const { container } = render(<Progress value={75} />)
    
    const progressBar = container.querySelector('div[style*="width: 75%"]')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveStyle({ width: '75%' })
  })

  it('renders with custom width class', () => {
    const { container } = render(<Progress value={50} width="w-1/2" />)
    
    const wrapper = container.querySelector('.w-1\\/2')
    expect(wrapper).toBeInTheDocument()
  })

  it('applies red color class', () => {
    const { container } = render(<Progress value={50} color="red" />)
    
    const progressBar = container.querySelector('.bg-red-500')
    expect(progressBar).toBeInTheDocument()
  })

  it('applies blue color class', () => {
    const { container } = render(<Progress value={50} color="blue" />)
    
    const progressBar = container.querySelector('.bg-blue-500')
    expect(progressBar).toBeInTheDocument()
  })

  it('applies green color class', () => {
    const { container } = render(<Progress value={50} color="green" />)
    
    const progressBar = container.querySelector('.bg-green-500')
    expect(progressBar).toBeInTheDocument()
  })

  it('uses default brand color when no color is specified', () => {
    const { container } = render(<Progress value={50} />)
    
    const progressBar = container.querySelector('.bg-brand-500')
    expect(progressBar).toBeInTheDocument()
  })

  it('handles edge cases - 0%', () => {
    const { container } = render(<Progress value={0} />)
    
    const progressBar = container.querySelector('div[style*="width: 0%"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('handles edge cases - 100%', () => {
    const { container } = render(<Progress value={100} />)
    
    const progressBar = container.querySelector('div[style*="width: 100%"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('handles all color variants', () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'teal', 'navy', 'lime', 'cyan', 'pink', 'purple', 'amber', 'indigo', 'gray']
    
    colors.forEach((color) => {
      const { container, unmount } = render(<Progress value={50} color={color as any} />)
      const progressBar = container.querySelector(`.bg-${color}-500`)
      expect(progressBar).toBeInTheDocument()
      unmount()
    })
  })
})


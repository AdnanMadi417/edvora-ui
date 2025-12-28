import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dropdown from './index'

describe('Dropdown Component', () => {
  const mockButton = <button>Click me</button>
  const mockChildren = <div>Dropdown Content</div>

  it('renders button and children', () => {
    render(
      <Dropdown button={mockButton} classNames="test-class">
        {mockChildren}
      </Dropdown>
    )
    
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(screen.getByText('Dropdown Content')).toBeInTheDocument()
  })

  it('dropdown is hidden by default', () => {
    const { container } = render(
      <Dropdown button={mockButton} classNames="test-class">
        {mockChildren}
      </Dropdown>
    )
    
    const dropdown = container.querySelector('.scale-0')
    expect(dropdown).toBeInTheDocument()
  })

  it('opens dropdown when button is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dropdown button={mockButton} classNames="test-class">
        {mockChildren}
      </Dropdown>
    )
    
    const button = screen.getByText('Click me')
    await user.click(button)
    
    const dropdown = container.querySelector('.scale-100')
    expect(dropdown).toBeInTheDocument()
  })

  it('closes dropdown when button is clicked again', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dropdown button={mockButton} classNames="test-class">
        {mockChildren}
      </Dropdown>
    )
    
    const button = screen.getByText('Click me')
    
    // Open dropdown
    await user.click(button)
    expect(container.querySelector('.scale-100')).toBeInTheDocument()
    
    // Close dropdown
    await user.click(button)
    expect(container.querySelector('.scale-0')).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <div>
        <Dropdown button={mockButton} classNames="test-class">
          {mockChildren}
        </Dropdown>
        <div data-testid="outside">Outside Element</div>
      </div>
    )
    
    const button = screen.getByText('Click me')
    
    // Open dropdown
    await user.click(button)
    expect(container.querySelector('.scale-100')).toBeInTheDocument()
    
    // Click outside
    const outsideElement = screen.getByTestId('outside')
    await user.click(outsideElement)
    
    expect(container.querySelector('.scale-0')).toBeInTheDocument()
  })

  it('applies custom classNames', () => {
    const { container } = render(
      <Dropdown button={mockButton} classNames="custom-dropdown-class">
        {mockChildren}
      </Dropdown>
    )
    
    const dropdown = container.querySelector('.custom-dropdown-class')
    expect(dropdown).toBeInTheDocument()
  })

  it('applies custom animation class', () => {
    const { container } = render(
      <Dropdown 
        button={mockButton} 
        classNames="test-class"
        animation="custom-animation"
      >
        {mockChildren}
      </Dropdown>
    )
    
    const dropdown = container.querySelector('.custom-animation')
    expect(dropdown).toBeInTheDocument()
  })

  it('uses default animation when not provided', () => {
    const { container } = render(
      <Dropdown button={mockButton} classNames="test-class">
        {mockChildren}
      </Dropdown>
    )
    
    const dropdown = container.querySelector('.origin-top-right')
    expect(dropdown).toBeInTheDocument()
    expect(dropdown).toHaveClass('transition-all', 'duration-300', 'ease-in-out')
  })

  it('does not close when clicking inside dropdown', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dropdown button={mockButton} classNames="test-class">
        <div data-testid="dropdown-content">Dropdown Content</div>
      </Dropdown>
    )
    
    const button = screen.getByText('Click me')
    
    // Open dropdown
    await user.click(button)
    expect(container.querySelector('.scale-100')).toBeInTheDocument()
    
    // Click inside dropdown
    const dropdownContent = screen.getByTestId('dropdown-content')
    await user.click(dropdownContent)
    
    // Should still be open
    expect(container.querySelector('.scale-100')).toBeInTheDocument()
  })
})


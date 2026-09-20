import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dropdown from './index'

describe('Dropdown Component', () => {
  const mockButton = <button>Click me</button>
  const mockChildren = <div>Dropdown Content</div>

  it('renders the trigger button', () => {
    render(
      <Dropdown button={mockButton} classNames="test-class">
        {mockChildren}
      </Dropdown>
    )

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('dropdown content is not rendered by default', () => {
    render(
      <Dropdown button={mockButton} classNames="test-class">
        {mockChildren}
      </Dropdown>
    )

    expect(screen.queryByText('Dropdown Content')).not.toBeInTheDocument()
  })

  it('opens dropdown when button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Dropdown button={mockButton} classNames="test-class">
        {mockChildren}
      </Dropdown>
    )

    await user.click(screen.getByText('Click me'))

    expect(await screen.findByText('Dropdown Content')).toBeInTheDocument()
  })

  it('closes dropdown when button is clicked again', async () => {
    const user = userEvent.setup()
    render(
      <Dropdown button={mockButton} classNames="test-class">
        {mockChildren}
      </Dropdown>
    )

    const button = screen.getByText('Click me')
    await user.click(button)
    expect(await screen.findByText('Dropdown Content')).toBeInTheDocument()

    await user.click(button)
    await waitFor(() => {
      expect(screen.queryByText('Dropdown Content')).not.toBeInTheDocument()
    })
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Dropdown button={mockButton} classNames="test-class">
          {mockChildren}
        </Dropdown>
        <div data-testid="outside">Outside Element</div>
      </div>
    )

    await user.click(screen.getByText('Click me'))
    expect(await screen.findByText('Dropdown Content')).toBeInTheDocument()

    await user.click(screen.getByTestId('outside'))
    await waitFor(() => {
      expect(screen.queryByText('Dropdown Content')).not.toBeInTheDocument()
    })
  })

  it('applies custom classNames to the dropdown panel', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dropdown button={mockButton} classNames="custom-dropdown-class">
        {mockChildren}
      </Dropdown>
    )

    await user.click(screen.getByText('Click me'))
    expect(await screen.findByText('Dropdown Content')).toBeInTheDocument()
    expect(container.querySelector('.custom-dropdown-class')).toBeInTheDocument()
  })

  it('does not close when clicking inside dropdown', async () => {
    const user = userEvent.setup()
    render(
      <Dropdown button={mockButton} classNames="test-class">
        <div data-testid="dropdown-content">Dropdown Content</div>
      </Dropdown>
    )

    await user.click(screen.getByText('Click me'))
    const dropdownContent = await screen.findByTestId('dropdown-content')

    await user.click(dropdownContent)

    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
  })
})

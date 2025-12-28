import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputField from './InputField'

describe('InputField Component', () => {
  it('renders with required props', () => {
    render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
      />
    )
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
      />
    )
    
    const input = screen.getByLabelText('Test Label') as HTMLInputElement
    await user.type(input, 'Hello World')
    
    expect(input.value).toBe('Hello World')
  })

  it('calls onChange handler when input changes', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        onChange={handleChange}
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    await user.type(input, 'test')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('displays error state', () => {
    render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        state="error"
        message="This field is required"
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(input).toHaveClass('border-red-500')
  })

  it('displays success state', () => {
    render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        state="success"
        message="Looks good!"
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    expect(screen.getByText('Looks good!')).toBeInTheDocument()
    expect(input).toHaveClass('border-green-500')
  })

  it('displays default state', () => {
    render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        state="default"
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveClass('border-gray-300')
  })

  it('renders as disabled', () => {
    render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        disabled
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not allow input when disabled', async () => {
    const user = userEvent.setup()
    render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        disabled
      />
    )
    
    const input = screen.getByLabelText('Test Label') as HTMLInputElement
    await user.type(input, 'test')
    
    expect(input.value).toBe('')
  })

  it('renders with auth variant', () => {
    const { container } = render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        variant="auth"
      />
    )
    
    const label = container.querySelector('label')
    expect(label).toHaveClass('ml-1.5')
  })

  it('renders with default variant', () => {
    const { container } = render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        variant="default"
      />
    )
    
    const label = container.querySelector('label')
    expect(label).toHaveClass('ml-3')
  })

  it('renders with different input types', () => {
    const { rerender } = render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        type="email"
      />
    )
    
    let input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('type', 'email')
    
    rerender(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        type="password"
      />
    )
    
    input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('associates message with input via aria-describedby', () => {
    render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        message="Helper text"
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    const message = screen.getByText('Helper text')
    
    expect(input).toHaveAttribute('aria-describedby', 'test-input-message')
    expect(message).toHaveAttribute('id', 'test-input-message')
  })

  it('applies extra className', () => {
    const { container } = render(
      <InputField
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
        extra="custom-wrapper-class"
      />
    )
    
    const wrapper = container.querySelector('.custom-wrapper-class')
    expect(wrapper).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    
    render(
      <InputField
        ref={ref}
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
      />
    )
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.id).toBe('test-input')
  })
})


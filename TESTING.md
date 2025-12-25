# Testing Guide

This project uses **Jest** and **React Testing Library** for unit testing React components.

## Setup

### Install Dependencies

First, install the required testing dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Configuration Files

- `jest.config.js` - Jest configuration for Next.js
- `jest.setup.js` - Global test setup (mocks, utilities)
- `__mocks__/` - Mock files for CSS, images, and other assets

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## Writing Tests

### Test File Naming

Test files should be named with `.test.tsx` or `.test.ts` extension, placed next to the component file or in a `__tests__` directory.

Examples:
- `Loading.test.tsx` (next to `Loading.tsx`)
- `__tests__/Loading.test.tsx` (in a tests directory)

### Basic Test Structure

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import YourComponent from './YourComponent'

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const user = userEvent.setup()
    render(<YourComponent />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

## Example Tests

### Loading Component Test

See `src/components/loading/Loading.test.tsx` for a complete example testing:
- Default props
- Custom props (size, color, text)
- Component rendering

### Checkbox Component Test

See `src/components/checkbox/index.test.tsx` for an example testing:
- Component rendering
- User interactions (clicking)
- Props handling
- CSS classes

## Testing Best Practices

### 1. Test User Behavior, Not Implementation

✅ **Good**: Test what the user sees and does
```tsx
it('shows error message when form is invalid', () => {
  render(<Form />)
  const submitButton = screen.getByRole('button', { name: /submit/i })
  fireEvent.click(submitButton)
  expect(screen.getByText('Please fill all fields')).toBeInTheDocument()
})
```

❌ **Bad**: Testing internal implementation
```tsx
it('sets error state to true', () => {
  // Don't test internal state directly
})
```

### 2. Use Semantic Queries

Prefer queries that reflect how users interact with your app:

1. `getByRole` - Most accessible (preferred)
2. `getByLabelText` - For form inputs
3. `getByPlaceholderText` - For inputs
4. `getByText` - For visible text
5. `getByTestId` - Last resort (add `data-testid` if needed)

### 3. Test Accessibility

```tsx
it('has accessible label', () => {
  render(<Input label="Email" />)
  expect(screen.getByLabelText('Email')).toBeInTheDocument()
})
```

### 4. Use `userEvent` for Interactions

`userEvent` simulates real user behavior better than `fireEvent`:

```tsx
import userEvent from '@testing-library/user-event'

it('handles input changes', async () => {
  const user = userEvent.setup()
  render(<Input />)
  
  const input = screen.getByRole('textbox')
  await user.type(input, 'test@example.com')
  
  expect(input).toHaveValue('test@example.com')
})
```

### 5. Test Edge Cases

- Empty states
- Error states
- Loading states
- Invalid inputs
- Boundary conditions

## Common Testing Patterns

### Testing Async Operations

```tsx
it('loads data on mount', async () => {
  render(<DataComponent />)
  
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

### Testing with Context/Providers

```tsx
import { render } from '@testing-library/react'
import { ThemeProvider } from 'your-theme-library'

const renderWithTheme = (ui) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

it('renders with theme', () => {
  renderWithTheme(<Component />)
  // test...
})
```

### Mocking Next.js Features

The `jest.setup.js` file already mocks:
- `next/navigation` (useRouter, usePathname, etc.)
- `next/image` component

### Testing API Calls

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

it('fetches and displays data', async () => {
  mockedAxios.get.mockResolvedValue({ data: { name: 'Test' } })
  
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## Coverage

To see what parts of your code are covered by tests:

```bash
npm run test:coverage
```

This generates a `coverage/` directory with an HTML report. Open `coverage/lcov-report/index.html` in your browser to see detailed coverage.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)


import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import AccountPasswordInput from '@/components/account-password-input'

describe('AccountPasswordInput', () => {
  it('should contain the update password button', () => {
    render(<AccountPasswordInput />)
    const button = screen.getByRole('button', { name: /update password/i })
    expect(button).toBeInTheDocument()
  })

  it('should toggle password visibility when the eye button is clicked', () => {
    render(<AccountPasswordInput />)

    const passwordInput = screen.getByPlaceholderText(
      /••••••••/i
    ) as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: '' })

    expect(passwordInput.type).toBe('password')

    fireEvent.click(toggleButton)

    expect(passwordInput.type).toBe('text')

    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('updates the password value on change', () => {
    render(<AccountPasswordInput />)
    const passwordInput = screen.getByPlaceholderText(
      /••••••••/i
    ) as HTMLInputElement

    fireEvent.change(passwordInput, { target: { value: 'new-password123' } })

    expect(passwordInput.value).toBe('new-password123')
  })
})

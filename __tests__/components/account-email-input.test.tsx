import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AccountEmailInput from '@/components/account-email-input'

describe('AccountEmailInput', () => {
  it('should contain the update email button', () => {
    render(<AccountEmailInput />)
    const button = screen.getByRole('button', { name: /update email/i })
    expect(button).toBeInTheDocument()
  })
})

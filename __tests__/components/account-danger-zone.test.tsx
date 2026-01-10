import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import AccountDangerZone from '@/components/account-danger-zone'

describe('Account danger zone', () => {
  it('should contain a red danger warning as a heading', () => {
    render(<AccountDangerZone />)

    const heading = screen.getByRole('heading', {
      name: /danger zone/i,
    })

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass('text-red-500')
  })

  it('should contain a delete account button', () => {
    render(<AccountDangerZone />)

    const button = screen.getByRole('button', {
      name: /delete account/i,
    })

    expect(button).toBeInTheDocument()
  })

  it('should open the confirmation dialog when "Delete account" button is clicked', () => {
    render(<AccountDangerZone />)

    const trigger = screen.getByRole('button', { name: /delete account/i })
    fireEvent.click(trigger)

    expect(screen.getByText(/are you absolutely sure\?/i)).toBeInTheDocument()
    expect(
      screen.getByText(/this action cannot be undone/i)
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /continue/i })
    ).toBeInTheDocument()
  })
})

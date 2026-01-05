import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AccountPreferences from '@/components/account-preferences'

jest.mock('@/components/mode-toggle', () => ({
  ModeToggle: () => <div data-testid='mode-toggle' />,
}))

describe('Account Preferences', () => {
  it('should render the mode toggle', () => {
    render(<AccountPreferences />)
    expect(screen.getByTestId('mode-toggle')).toBeInTheDocument()
  })
})

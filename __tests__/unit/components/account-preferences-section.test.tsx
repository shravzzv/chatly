import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AccountPreferencesSection from '@/components/account-preferences-section'

jest.mock('@/components/mode-toggle', () => ({
  ModeToggle: () => <div data-testid='mode-toggle' />,
}))

jest.mock('@/components/notifications-toggle', () => ({
  NotificationsToggle: () => <div data-testid='notifications-toggle' />,
}))

describe('AccountPreferencesSection', () => {
  it('should show a heading: Preferences', async () => {
    render(<AccountPreferencesSection />)

    const heading = screen.getByRole('heading', {
      name: /preferences/i,
      level: 2,
    })

    expect(heading).toBeInTheDocument()
  })

  it('should contain the mode toggle', () => {
    render(<AccountPreferencesSection />)

    expect(screen.getByTestId('mode-toggle')).toBeInTheDocument()
  })

  it('should contain the notifications toggle', () => {
    render(<AccountPreferencesSection />)

    expect(screen.getByTestId('notifications-toggle')).toBeInTheDocument()
  })
})

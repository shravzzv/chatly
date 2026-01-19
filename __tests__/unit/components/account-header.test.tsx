import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AccountHeader from '@/components/account-header'

jest.mock('@/components/sidebar-trigger', () => ({
  SidebarTrigger: () => <button data-testid='sidebar-trigger'>Sidebar</button>,
}))

describe('Account header', () => {
  it('should contain the sidebar trigger', () => {
    render(<AccountHeader />)
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
  })

  it('should show a heading: Account', async () => {
    render(<AccountHeader />)

    const heading = screen.getByRole('heading', {
      name: /account/i,
      level: 1,
    })

    expect(heading).toBeInTheDocument()
  })
})

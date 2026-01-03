import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '@/app/(private)/profile/page'

jest.mock('@/components/sidebar-trigger', () => ({
  SidebarTrigger: () => <button data-testid='sidebar-trigger'>Sidebar</button>,
}))

describe('Profile page', () => {
  it('renders the sidebar trigger', () => {
    render(<Page />)
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
  })
})

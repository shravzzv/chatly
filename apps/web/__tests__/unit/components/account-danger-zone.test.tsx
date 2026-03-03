import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountDangerZone from '@/components/account-danger-zone'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { getSubscriptions, deleteUser } from '@/app/actions'

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: jest.fn(),
}))

jest.mock('@/app/actions', () => ({
  getSubscriptions: jest.fn(),
  deleteUser: jest.fn(),
}))

describe('Account danger zone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useChatlyStore as jest.Mock).mockImplementation((selector) =>
      selector({
        user: { id: 'user_123' },
      }),
    )
  })

  it('should contain a red "danger zone" warning', () => {
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

  it('shows subscription dialog if user has an active subscription', async () => {
    ;(getSubscriptions as jest.Mock).mockResolvedValue([{ status: 'active' }])

    render(<AccountDangerZone />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /delete account/i }))

    expect(
      await screen.findByText(/you have an active subscription/i),
    ).toBeInTheDocument()
  })

  it('shows delete confirmation if user has no active subscription', async () => {
    ;(getSubscriptions as jest.Mock).mockResolvedValue([])

    render(<AccountDangerZone />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /delete account/i }))

    expect(
      await screen.findByText(/are you absolutely sure/i),
    ).toBeInTheDocument()
  })

  it('calls deleteUser when user confirms deletion', async () => {
    const user = userEvent.setup()
    ;(getSubscriptions as jest.Mock).mockResolvedValue([])

    render(<AccountDangerZone />)

    await user.click(screen.getByRole('button', { name: /delete account/i }))

    const continueBtn = await screen.findByRole('button', {
      name: /continue/i,
    })

    await user.click(continueBtn)

    expect(deleteUser).toHaveBeenCalledWith('user_123')
  })
})

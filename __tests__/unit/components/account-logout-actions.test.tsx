import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountLogoutActions from '@/components/account-logout-actions'

const logoutMock = jest.fn<
  Promise<void>,
  ['local' | 'global' | 'others' | null]
>()

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: <T,>(selector: (state: { logout: typeof logoutMock }) => T) =>
    selector({
      logout: logoutMock,
    }),
}))

describe('AccountLogoutActions', () => {
  it('renders logout actions', () => {
    render(<AccountLogoutActions />)

    expect(screen.getByText(/log out$/i)).toBeInTheDocument()
    expect(screen.getByText(/log out of all sessions/i)).toBeInTheDocument()
  })

  it('calls logout with local scope', async () => {
    logoutMock.mockResolvedValue(undefined)

    render(<AccountLogoutActions />)

    const user = userEvent.setup()
    await user.click(screen.getByText(/^log out$/i))

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledWith('local')
    })
  })

  it('opens confirmation dialog for global logout', async () => {
    render(<AccountLogoutActions />)

    const user = userEvent.setup()
    await user.click(screen.getByText(/log out of all sessions/i))

    expect(
      await screen.findByText(/log out of all sessions\?/i)
    ).toBeInTheDocument()
  })

  it('logs out of other sessions', async () => {
    logoutMock.mockResolvedValue(undefined)

    render(<AccountLogoutActions />)

    const user = userEvent.setup()
    await user.click(screen.getByText(/log out of all sessions/i))
    await user.click(
      await screen.findByRole('button', {
        name: /log out of all other sessions/i,
      })
    )

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledWith('others')
    })
  })

  it('logs out of all sessions when confirmed', async () => {
    logoutMock.mockResolvedValue(undefined)

    render(<AccountLogoutActions />)

    const user = userEvent.setup()
    await user.click(screen.getByText(/log out of all sessions/i))
    await user.click(await screen.findByText(/continue/i))

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledWith('global')
    })
  })

  it('disables buttons while logging out', async () => {
    let resolveLogout!: (value: void | PromiseLike<void>) => void
    logoutMock.mockImplementation(
      () => new Promise<void>((resolve) => (resolveLogout = resolve))
    )

    render(<AccountLogoutActions />)

    const user = userEvent.setup()
    const logoutButton = screen.getByRole('button', { name: /^log out$/i })
    const allSessionsButton = screen.getByRole('button', {
      name: /log out of all sessions/i,
    })

    await user.click(logoutButton)
    await waitFor(() => {
      expect(logoutButton).toBeDisabled()
      expect(allSessionsButton).toBeDisabled()
    })

    resolveLogout()
  })
})

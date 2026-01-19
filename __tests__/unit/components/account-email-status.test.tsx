import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountEmailStatus from '@/components/account-email-status'
import { ChatlyStoreProvider } from '@/providers/chatly-store-provider'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

jest.mock('next/navigation')
jest.mock('sonner')

jest.mock('@/utils/supabase/client', () => {
  const resend = jest.fn()

  return {
    createClient: () => ({
      auth: {
        resend,
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
    }),
    __mock: { resend },
  }
})

const { __mock } = jest.requireMock('@/utils/supabase/client')
const mockResend = __mock.resend

const renderWithUser = (user: Partial<User> | null) =>
  render(
    <ChatlyStoreProvider hydrationData={{ user: user as User }}>
      <AccountEmailStatus />
    </ChatlyStoreProvider>
  )

describe('AccountEmailStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when user is missing', () => {
    const { container } = renderWithUser(null)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows verified message when email is confirmed', () => {
    renderWithUser({
      email: 'john@example.com',
      new_email: '',
    })

    expect(screen.getByText(/verified and active/i)).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('shows confirmation alert when new email is pending', () => {
    renderWithUser({
      email: 'old@example.com',
      new_email: 'new@example.com',
    })

    expect(screen.getByText(/confirm your new email/i)).toBeInTheDocument()
    expect(screen.getByText('new@example.com')).toBeInTheDocument()
    expect(screen.getByText('old@example.com')).toBeInTheDocument()
  })

  it('resends confirmation email when button is clicked', async () => {
    mockResend.mockResolvedValue({ error: null })

    renderWithUser({
      email: 'old@example.com',
      new_email: 'new@example.com',
    })

    const user = userEvent.setup()
    await user.click(
      screen.getByRole('button', { name: /resend confirmation/i })
    )

    await waitFor(() => {
      expect(mockResend).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith(
        'Email confirmation sent. Check your inbox.'
      )
    })
  })

  it('shows error toast when resend fails', async () => {
    mockResend.mockResolvedValue({
      error: { message: 'Boom' },
    })

    renderWithUser({
      email: 'old@example.com',
      new_email: 'new@example.com',
    })

    const user = userEvent.setup()
    await user.click(
      screen.getByRole('button', { name: /resend confirmation/i })
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to send email confirmation'
      )
    })
  })
})

import { render, screen } from '@testing-library/react'
import AccountEmailInput from '@/components/account-email-input'
import { ChatlyStoreProvider } from '@/providers/chatly-store-provider'
import { User } from '@supabase/supabase-js'

jest.mock('next/navigation')
jest.mock('sonner')

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  }),
}))

const renderWithUser = (email = 'john@example.com') =>
  render(
    <ChatlyStoreProvider
      hydrationData={{
        user: { id: '1', email } as User,
      }}
    >
      <AccountEmailInput />
    </ChatlyStoreProvider>
  )

describe('AccountEmailInput', () => {
  it('renders with the user email prefilled', () => {
    renderWithUser('john@example.com')

    const input = screen.getByLabelText(/email/i) as HTMLInputElement
    expect(input.value).toBe('john@example.com')
  })
})

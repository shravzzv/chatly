import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AccountProfileSection from '@/components/account-profile-section'
import { ChatlyStoreProvider } from '@/providers/chatly-store-provider'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types/profile'

jest.mock('next/navigation')

jest.mock('uuid', () => ({
  v4: () => 'mocked-uuid',
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  }),
}))

jest.mock('@/app/actions', () => ({
  updateProfile: jest.fn(),
}))

jest.mock('@/components/skeletons/account-profile-section-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid='skeleton'></div>,
}))

const mockProfile: Profile = {
  user_id: '123',
  name: 'Test User',
  username: 'testuser',
  bio: 'Hello world',
  theme: 'system',
  id: 'profile-id',
  avatar_url: null,
  status: 'online',
  last_seen_at: null,
  created_at: '',
  updated_at: '',
}

const mockUser = {
  id: '123',
  email: 'test@example.com',
}

const renderWithProvider = (children: React.ReactNode) => {
  return render(
    <ChatlyStoreProvider
      hydrationData={{
        user: mockUser as User,
        profile: mockProfile as Profile,
      }}
    >
      {children}
    </ChatlyStoreProvider>
  )
}

describe('AccountProfileSection', () => {
  it('should show a skeleton when profile is missing', () => {
    render(
      <ChatlyStoreProvider hydrationData={{ user: null, profile: null }}>
        <AccountProfileSection />
      </ChatlyStoreProvider>
    )

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    const heading = screen.queryByRole('heading', { name: /profile/i })
    expect(heading).not.toBeInTheDocument()
  })

  it('should show the correct heading and load profile data into inputs', async () => {
    renderWithProvider(<AccountProfileSection />)

    // Check Heading
    expect(
      screen.getByRole('heading', { name: /^profile$/i, level: 2 })
    ).toBeInTheDocument()

    const nameInput = screen.getByLabelText(/^Name$/i, { selector: 'input' })
    const usernameInput = screen.getByLabelText(/^Username$/i, {
      selector: 'input',
    })
    const bioTextarea = screen.getByLabelText(/^Bio$/i, {
      selector: 'textarea',
    })

    expect(nameInput).toHaveValue('Test User')
    expect(usernameInput).toHaveValue('testuser')
    expect(bioTextarea).toHaveValue('Hello world')
  })

  it('disables the save button when the form is not dirty', () => {
    renderWithProvider(<AccountProfileSection />)
    const saveButton = screen.getByRole('button', { name: /save/i })
    expect(saveButton).toBeDisabled()
  })
})

import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccountAvatarSection from '@/components/account-avatar-section'
import { Profile } from '@/types/profile'
import { ChatlyStoreProvider } from '@/providers/chatly-store-provider'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

jest.mock('next/navigation')

jest.mock('uuid', () => ({
  v4: () => 'mocked-uuid',
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({
          data: { publicUrl: 'http://test.com/avatar.png' },
        }),
      }),
    },
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: () => ({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { avatar_url: 'new-url' },
              error: null,
            }),
          }),
        }),
      }),
    }),
  }),
}))

const mockUser = {
  id: '123',
  email: 'test@example.com',
}

const mockProfile: Profile = {
  id: '3114f79c-6287-44da-b465-cb65db6ff8a7',
  user_id: 'c6979768-8321-4a6f-b9ff-0d4aa1c47755',
  name: 'John Doe',
  username: 'johndoe',
  avatar_url: '',
  bio: 'I am awesome.',
  status: 'offline',
  last_seen_at: null,
  theme: 'system',
  created_at: '2025-12-08T16:07:02Z',
  updated_at: '2026-01-06T04:59:23Z',
}

const renderWithProvider = (children: React.ReactElement) => {
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

describe('AccountAvatarSection', () => {
  it('renders the correct initial helper text', () => {
    renderWithProvider(<AccountAvatarSection profile={mockProfile} />)
    expect(screen.getByText(/JPG, PNG or GIF. Max 5MB/i)).toBeInTheDocument()
  })

  it('shows error toast if non-image file is selected', async () => {
    renderWithProvider(<AccountAvatarSection profile={mockProfile} />)

    const input = screen.getByLabelText(/edit/i, {
      selector: 'input',
    }) as HTMLInputElement

    const file = new File(['foo'], 'foo.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(toast.error).toHaveBeenCalledWith('Please upload an image')
  })

  it('shows error toast if file is too large', async () => {
    renderWithProvider(<AccountAvatarSection profile={mockProfile} />)

    const input = screen.getByLabelText(/edit/i, { selector: 'input' })

    // Create a file larger than 5MB
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.png', {
      type: 'image/png',
    })
    fireEvent.change(input, { target: { files: [largeFile] } })

    expect(toast.error).toHaveBeenCalledWith('Image must be under 5MB')
  })

  it('triggers upload flow for valid image', async () => {
    renderWithProvider(<AccountAvatarSection profile={mockProfile} />)

    const input = screen.getByLabelText(/edit/i, { selector: 'input' })
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })

    // Check if it enters loading state
    expect(screen.getByText(/Uploading your new look.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Avatar updated successfully')
    })
  })
})

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '@/app/(private)/dashboard/page'

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}))

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-user', () => ({
  useUser: () => ({
    user: { id: 'user-1' },
    loading: false,
    error: null,
  }),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

jest.mock('@/hooks/use-typing-indicator', () => ({
  useTypingIndicator: () => ({
    isTyping: false,
    updateTypingStatus: jest.fn(),
  }),
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        or: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: jest.fn(),
      }),
    }),
    removeChannel: jest.fn(),
  }),
}))

it('renders the heading "Inbox"', async () => {
  render(<Page />)

  const heading = await screen.findByRole('heading', {
    name: /inbox/i,
  })

  expect(heading).toBeInTheDocument()
})

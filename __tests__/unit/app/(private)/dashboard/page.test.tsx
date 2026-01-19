import { render, waitFor } from '@testing-library/react'
import Dashboard from '@/app/(private)/dashboard/page'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/use-user'
import { getCheckoutUrl } from '@/lib/get-checkout-url'
import { SidebarProvider } from '@/components/ui/sidebar'

jest.mock('next/navigation')
jest.mock('@/hooks/use-user')
jest.mock('@/lib/get-checkout-url')
jest.mock('uuid', () => ({
  v4: () => 'mocked-uuid',
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

jest.mock('@/utils/supabase/client', () => {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn(),
  }

  return {
    createClient: () => ({
      from: () => queryBuilder,
      channel: () => ({
        on: () => ({ subscribe: jest.fn() }),
      }),
      removeChannel: jest.fn(),
    }),
  }
})

describe('Dashboard', () => {
  it('redirects to the correct LS checkout URL when arriving from pricing signup', async () => {
    const replace = jest.fn()

    ;(useRouter as jest.Mock).mockReturnValue({ replace })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        if (key === 'plan') return 'pro'
        if (key === 'billing') return 'monthly'
        return null
      },
    })
    ;(useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1', email: 'test@test.com' },
      loading: false,
      error: null,
    })
    ;(getCheckoutUrl as jest.Mock).mockReturnValue(
      'https://chatly-store.lemonsqueezy.com/buy/test-checkout',
    )

    render(
      <SidebarProvider>
        <Dashboard />
      </SidebarProvider>,
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        'https://chatly-store.lemonsqueezy.com/buy/test-checkout',
      )
    })
  })
})

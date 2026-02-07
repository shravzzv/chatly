import { renderHook, waitFor } from '@testing-library/react'
import { useUsage } from '@/hooks/use-usage'
import { createClient } from '@/utils/supabase/client'
import { getSubscriptions } from '@/app/actions'
import { getCurrentPlan } from '@/lib/billing'
import type { PostgrestError } from '@supabase/supabase-js'

let mockUser: { id: string } | null = { id: 'user-1' }

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: <T>(
    selector: (state: { user: { id: string } | null }) => T,
  ): T => selector({ user: mockUser }),
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/app/actions', () => ({
  getSubscriptions: jest.fn(),
}))

jest.mock('@/lib/billing', () => ({
  getCurrentPlan: jest.fn(),
}))

const mockSupabaseUsage = (
  data: object | null,
  error: PostgrestError | null = null,
) => {
  ;(createClient as jest.Mock).mockReturnValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data, error }),
          }),
        }),
      }),
    }),
  })
}

describe('useUsage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = { id: 'user-1' }
  })

  it('returns safe defaults when no authenticated user', async () => {
    mockUser = null

    const { result } = renderHook(() => useUsage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.plan).toBe('free')
    expect(result.current.aiUsed).toBe(0)
    expect(result.current.mediaUsed).toBe(0)
    expect(result.current.canUseAi).toBe(false)
    expect(result.current.canUseMedia).toBe(false)
    expect(result.current.aiRemaining).toBe(0)
    expect(result.current.mediaRemaining).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('computes usage and limits correctly for a paid plan', async () => {
    mockSupabaseUsage({
      user_id: 'user-1',
      window_date: '2025-01-01',
      ai_used: 2,
      media_used: 1,
    })
    ;(getSubscriptions as jest.Mock).mockResolvedValue([{ plan: 'pro' }])
    ;(getCurrentPlan as jest.Mock).mockReturnValue('pro')

    const { result } = renderHook(() => useUsage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.plan).toBe('pro')

    expect(result.current.aiUsed).toBe(2)
    expect(result.current.mediaUsed).toBe(1)

    expect(result.current.canUseAi).toBe(true)
    expect(result.current.canUseMedia).toBe(true)

    expect(result.current.aiRemaining).toBe(3)
    expect(result.current.mediaRemaining).toBe(4)
  })

  it('disallows usage when limits are exceeded', async () => {
    mockSupabaseUsage({
      user_id: 'user-1',
      window_date: '2025-01-01',
      ai_used: 5,
      media_used: 5,
    })
    ;(getSubscriptions as jest.Mock).mockResolvedValue([{ plan: 'pro' }])
    ;(getCurrentPlan as jest.Mock).mockReturnValue('pro')

    const { result } = renderHook(() => useUsage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.canUseAi).toBe(false)
    expect(result.current.canUseMedia).toBe(false)
    expect(result.current.aiRemaining).toBe(0)
    expect(result.current.mediaRemaining).toBe(0)
  })

  it('sets error when usage fetch fails', async () => {
    const error = { message: 'db error' } as PostgrestError

    mockSupabaseUsage(null, error)
    ;(getSubscriptions as jest.Mock).mockResolvedValue([])
    ;(getCurrentPlan as jest.Mock).mockReturnValue('free')

    const { result } = renderHook(() => useUsage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(error)
  })

  it('defaults to free plan if plan fetch fails', async () => {
    mockSupabaseUsage({
      user_id: 'user-1',
      window_date: '2025-01-01',
      ai_used: 0,
      media_used: 0,
    })
    ;(getSubscriptions as jest.Mock).mockRejectedValue(
      new Error('network error'),
    )

    const { result } = renderHook(() => useUsage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.plan).toBe('free')
    expect(result.current.canUseAi).toBe(false)
    expect(result.current.canUseMedia).toBe(false)
  })
})

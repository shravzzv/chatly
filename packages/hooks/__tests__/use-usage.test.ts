import { getCurrentPlan } from '@chatly/lib/billing'
import type { PostgrestError } from '@supabase/supabase-js'
import { renderHook, waitFor } from '@testing-library/react'
import { useUsage } from '../src/use-usage'

jest.mock('@chatly/lib/billing', () => ({
  getCurrentPlan: jest.fn(),
  PLAN_LIMITS: {
    free: { ai: 0, media: 0 },
    pro: { ai: 5, media: 5 },
    enterprise: { ai: 20, media: 50 },
  },
}))

type MockSupabaseOptions = {
  usageData?: any
  usageError?: PostgrestError | null
  subsData?: any[]
  subsError?: PostgrestError | null
}

function createMockSupabase({
  usageData = null,
  usageError = null,
  subsData = [],
  subsError = null,
}: MockSupabaseOptions = {}) {
  return {
    from: jest.fn((table: string) => {
      if (table === 'usage_windows') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: usageData,
                  error: usageError,
                }),
              }),
            }),
          }),
        }
      }

      if (table === 'subscriptions') {
        return {
          select: () => ({
            eq: async () => ({
              data: subsData,
              error: subsError,
            }),
          }),
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    }),

    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),

    removeChannel: jest.fn(),
  }
}

describe('useUsage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns safe defaults when no authenticated user', async () => {
    const supabase = createMockSupabase()

    const { result } = renderHook(() => useUsage(supabase as any, null))

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
    const supabase = createMockSupabase({
      usageData: {
        user_id: 'user-1',
        window_date: '2025-01-01',
        ai_used: 2,
        media_used: 1,
      },
      subsData: [{ plan: 'pro' }],
    })

    ;(getCurrentPlan as jest.Mock).mockReturnValue('pro')

    const { result } = renderHook(() => useUsage(supabase as any, 'user-1'))

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
    const supabase = createMockSupabase({
      usageData: {
        user_id: 'user-1',
        window_date: '2025-01-01',
        ai_used: 5,
        media_used: 5,
      },
      subsData: [{ plan: 'pro' }],
    })

    ;(getCurrentPlan as jest.Mock).mockReturnValue('pro')

    const { result } = renderHook(() => useUsage(supabase as any, 'user-1'))

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

    const supabase = createMockSupabase({
      usageError: error,
    })

    const { result } = renderHook(() => useUsage(supabase as any, 'user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(error)
  })

  it('defaults to free plan if plan fetch fails', async () => {
    const supabase = createMockSupabase({
      usageData: {
        user_id: 'user-1',
        window_date: '2025-01-01',
        ai_used: 0,
        media_used: 0,
      },
      subsError: { message: 'fail' } as any,
    })

    const { result } = renderHook(() => useUsage(supabase as any, 'user-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.plan).toBe('free')
  })
})

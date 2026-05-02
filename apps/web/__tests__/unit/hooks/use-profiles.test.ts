import { useProfiles } from '@/hooks/use-profiles'
import { createClient } from '@/utils/supabase/client'
import type { Profile } from '@chatly/types/profile'
import { type PostgrestError } from '@supabase/supabase-js'
import { act, renderHook, waitFor } from '@testing-library/react'

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: <T>(
    selector: (state: {
      user: { id: string } | null
      setProfile: jest.Mock
    }) => T,
  ): T =>
    selector({
      user: { id: 'user-1' },
      setProfile: jest.fn(),
    }),
}))

function createSupabaseMock({
  data,
  error,
}: {
  data: Profile[] | null
  error: PostgrestError | null
}) {
  const channelMock = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
  }

  return {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() =>
          Promise.resolve({
            data,
            error,
          }),
        ),
      })),
    })),
    channel: jest.fn(() => channelMock),
    removeChannel: jest.fn(),
  }
}

const mockProfiles: Profile[] = [
  { id: '1', user_id: 'u1', name: 'John Doe', username: 'johndoe' } as Profile,
  {
    id: '2',
    user_id: 'u2',
    name: 'Jane Smith',
    username: 'janesmith',
  } as Profile,
]

describe('useProfiles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Silence the expected error/warn logs
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('starts in loading state with empty data', async () => {
    ;(createClient as jest.Mock).mockReturnValue(
      createSupabaseMock({ data: [], error: null }),
    )

    const { result } = renderHook(() => useProfiles(''))

    // Even for sync checks, it's safer to check the initial state
    // before the useEffect kicks in or wait for the first cycle
    expect(result.current.loading).toBe(true)
    expect(result.current.profiles).toEqual([])

    // We must wait for the hook to finish its internal useEffect
    // to avoid act() warnings when the test ends
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('fetches profiles successfully', async () => {
    ;(createClient as jest.Mock).mockReturnValue(
      createSupabaseMock({ data: mockProfiles, error: null }),
    )

    const { result } = renderHook(() => useProfiles(''))

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 2000 },
    )

    expect(result.current.error).toBeNull()
    expect(result.current.profiles).toEqual(mockProfiles)
    expect(result.current.filteredProfiles).toEqual(mockProfiles)
  })

  it('filters profiles by search query', async () => {
    ;(createClient as jest.Mock).mockReturnValue(
      createSupabaseMock({ data: mockProfiles, error: null }),
    )

    const { result, rerender } = renderHook(({ query }) => useProfiles(query), {
      initialProps: { query: '' },
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Wrapping rerender in act() ensures the filter logic is tracked
    act(() => {
      rerender({ query: 'john' })
    })

    expect(result.current.filteredProfiles).toHaveLength(1)
    expect(result.current.filteredProfiles[0].name).toBe('John Doe')
  })

  it('sets error state when fetch fails', async () => {
    const error = { message: 'DB error' } as PostgrestError

    ;(createClient as jest.Mock).mockReturnValue(
      createSupabaseMock({ data: null, error }),
    )

    const { result } = renderHook(() => useProfiles(''))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.profiles).toEqual([])
    expect(result.current.error).toEqual(error)
    // Verify our console.error mock was called
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching profiles:',
      error,
    )
  })
})

import { useProfiles } from '@chatly/hooks/use-profiles'
import type { Profile } from '@chatly/types/profile'
import { type PostgrestError } from '@supabase/supabase-js'
import { act, renderHook, waitFor } from '@testing-library/react'

const mockProfiles: Profile[] = [
  { id: '1', user_id: 'u1', name: 'John Doe', username: 'johndoe' } as Profile,
  {
    id: '2',
    user_id: 'u2',
    name: 'Jane Smith',
    username: 'janesmith',
  } as Profile,
]

type RealtimeCallback = (payload: any) => void

type ChannelMock = {
  on: jest.Mock<
    ChannelMock,
    [string, Record<string, unknown>, RealtimeCallback]
  >
  subscribe: jest.Mock<ChannelMock, []>
}

export function createMockSupabase({
  profiles = [],
  error = null,
}: {
  profiles?: Profile[] | null
  error?: PostgrestError | null
} = {}) {
  let realtimeCallback: RealtimeCallback

  const channelMock: ChannelMock = {
    on: jest.fn((_event, _filter, cb) => {
      realtimeCallback = cb
      return channelMock
    }),
    subscribe: jest.fn(() => channelMock),
  }

  const supabase = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(async () => ({
          data: profiles,
          error,
        })),
      })),
    })),

    channel: jest.fn(() => channelMock),
    removeChannel: jest.fn(),
  }

  return {
    supabase,
    getRealtimeCallback: () => realtimeCallback,
  }
}

describe('useProfiles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('starts in loading state with empty data', async () => {
    const { supabase } = createMockSupabase({
      profiles: [],
    })

    const { result } = renderHook(() => useProfiles('', supabase as any))

    expect(result.current.loading).toBe(true)
    expect(result.current.profiles).toEqual([])

    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('fetches profiles on mount', async () => {
    const { supabase } = createMockSupabase({
      profiles: mockProfiles,
    })

    const { result } = renderHook(() => useProfiles('', supabase as any))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.profiles).toEqual(mockProfiles)
    expect(result.current.filteredProfiles).toEqual(mockProfiles)
  })

  it('filters profiles by search query', async () => {
    const { supabase } = createMockSupabase({
      profiles: mockProfiles,
    })

    const { result, rerender } = renderHook(
      ({ query }) => useProfiles(query, supabase as any),
      {
        initialProps: { query: '' },
      },
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      rerender({ query: 'john' })
    })

    expect(result.current.filteredProfiles).toHaveLength(1)
    expect(result.current.filteredProfiles[0].name).toBe('John Doe')
  })

  it('sets error state when fetch fails', async () => {
    const error = { message: 'DB error' } as PostgrestError

    const { supabase } = createMockSupabase({
      profiles: null,
      error,
    })

    const { result } = renderHook(() => useProfiles('', supabase as any))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.profiles).toEqual([]) // assumes you use `data ?? []`
    expect(result.current.error).toEqual(error)

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching profiles:',
      error,
    )
  })

  it('handles fetch failure with undefined data', async () => {
    const mockError = { message: 'fail' } as PostgrestError

    const { supabase } = createMockSupabase({
      profiles: undefined as any,
      error: mockError,
    })

    const { result } = renderHook(() => useProfiles('', supabase as any))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toEqual(mockError)
  })
})

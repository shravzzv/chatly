import { renderHook, waitFor } from '@testing-library/react'
import { useProfiles } from '@/hooks/use-profiles'
import { type Profile } from '@/types/profile'
import { createClient } from '@/utils/supabase/client'
import { type PostgrestError } from '@supabase/supabase-js'

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
  {
    id: '1',
    user_id: 'u1',
    name: 'John Doe',
    username: 'johndoe',
  } as Profile,
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
  })

  it('starts in loading state with empty data', () => {
    ;(createClient as jest.Mock).mockReturnValue(
      createSupabaseMock({ data: [], error: null }),
    )

    const { result } = renderHook(() => useProfiles(''))

    expect(result.current.loading).toBe(true)
    expect(result.current.profiles).toEqual([])
    expect(result.current.filteredProfiles).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('fetches profiles successfully', async () => {
    ;(createClient as jest.Mock).mockReturnValue(
      createSupabaseMock({ data: mockProfiles, error: null }),
    )

    const { result } = renderHook(() => useProfiles(''))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

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

    rerender({ query: 'john' })

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
    expect(result.current.filteredProfiles).toEqual([])
    expect(result.current.error).toEqual(error)
  })
})

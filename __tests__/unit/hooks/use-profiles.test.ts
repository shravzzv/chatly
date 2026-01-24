import { renderHook, waitFor } from '@testing-library/react'
import { useProfiles } from '@/hooks/use-profiles'
import { type Profile } from '@/types/profile'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { type PostgrestError } from '@supabase/supabase-js'

jest.mock('sonner')
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

function mockSupabaseSuccess(data: Profile[]) {
  ;(createClient as jest.Mock).mockReturnValue({
    from: () => ({
      select: () => ({
        order: () =>
          Promise.resolve({
            data,
            error: null,
          }),
      }),
    }),
  })
}

function mockSupabaseError(error: PostgrestError) {
  ;(createClient as jest.Mock).mockReturnValue({
    from: () => ({
      select: () => ({
        order: () =>
          Promise.resolve({
            data: null,
            error,
          }),
      }),
    }),
  })
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
    mockSupabaseSuccess([])

    const { result } = renderHook(() => useProfiles(''))

    expect(result.current.loading).toBe(true)
    expect(result.current.profiles).toEqual([])
    expect(result.current.filteredProfiles).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('fetches profiles successfully', async () => {
    mockSupabaseSuccess(mockProfiles)

    const { result } = renderHook(() => useProfiles(''))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.profiles).toEqual(mockProfiles)
    expect(result.current.filteredProfiles).toEqual(mockProfiles)
  })

  it('filters profiles by search query', async () => {
    mockSupabaseSuccess(mockProfiles)

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

  it('sets error state and shows toast on failure', async () => {
    const error = { message: 'DB error' }
    mockSupabaseError(error as PostgrestError)

    const { result } = renderHook(() => useProfiles(''))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.profiles).toEqual([])
    expect(result.current.error).toEqual(error)
    expect(toast.error).toHaveBeenCalledWith('Failed to load profiles')
  })
})

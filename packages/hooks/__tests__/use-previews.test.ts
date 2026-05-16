import { usePreviews } from '@chatly/hooks/use-previews'
import { derivePreview } from '@chatly/lib/previews'
import type { Message } from '@chatly/types/message'
import { act, renderHook, waitFor } from '@testing-library/react'

jest.mock('@chatly/lib/messages', () => ({
  getPartnerId: jest.fn((msg: Message, currentUserId: string) =>
    msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id,
  ),
}))

jest.mock('@chatly/lib/previews', () => ({
  derivePreview: jest.fn((msg: Message, currentUserId: string) => ({
    text: msg.text,
    updatedAt: msg.updated_at,
    isOwnMsg: msg.sender_id === currentUserId,
  })),
  derivePreviews: jest.fn(() => ({})),
}))

type MockSupabaseResponse = {
  data: any
  error: any
}

function createMockSupabase({
  fetchResponse = { data: [], error: null },
  deleteResponse = { data: null, error: null },
}: {
  fetchResponse?: MockSupabaseResponse
  deleteResponse?: MockSupabaseResponse
} = {}) {
  let orderCallCount = 0

  return {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          order: jest.fn(() => {
            orderCallCount += 1

            // First order() call = initial fetch
            if (orderCallCount === 1) {
              return Promise.resolve(fetchResponse)
            }

            // Second order() call = deletePreview rebuild
            return {
              limit: jest.fn(() => ({
                maybeSingle: jest.fn(() => Promise.resolve(deleteResponse)),
              })),
            }
          }),
        })),
      })),
    })),
  }
}

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  text: 'hello',
  sender_id: 'user-1',
  receiver_id: 'user-2',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const waitForMount = async (result: any) => {
  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })
}

describe('usePreviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('starts in loading state', () => {
    const supabase = createMockSupabase()

    const { result } = renderHook(() => usePreviews(supabase as any, 'user-1'))

    expect(result.current.loading).toBe(true)
  })

  it('resolves to empty previews when DB returns no rows', async () => {
    const supabase = createMockSupabase({
      fetchResponse: {
        data: [],
        error: null,
      },
    })

    const { result } = renderHook(() => usePreviews(supabase as any, 'user-1'))
    await waitForMount(result)

    expect(result.current.previews).toEqual({})
    expect(result.current.error).toBeNull()
  })

  describe('updatePreview', () => {
    it('creates or replaces a preview for the partner', async () => {
      const supabase = createMockSupabase()
      const { result } = renderHook(() =>
        usePreviews(supabase as any, 'user-1'),
      )

      await waitForMount(result)
      const msg = makeMessage()

      act(() => {
        result.current.updatePreview(msg)
      })

      expect(result.current.previews['user-2']).toEqual(
        derivePreview(msg, 'user-1'),
      )
    })

    it('ignores stale updates based on updated_at', async () => {
      const supabase = createMockSupabase()
      const { result } = renderHook(() =>
        usePreviews(supabase as any, 'user-1'),
      )
      await waitForMount(result)

      const newer = makeMessage({
        updated_at: '2024-01-02T00:00:00Z',
      })

      const older = makeMessage({
        updated_at: '2024-01-01T00:00:00Z',
      })

      act(() => {
        result.current.updatePreview(newer)
      })

      act(() => {
        result.current.updatePreview(older)
      })

      expect(result.current.previews['user-2']?.updatedAt).toBe(
        newer.updated_at,
      )
    })
  })

  describe('deletePreview', () => {
    it('does nothing if preview does not exist', async () => {
      const supabase = createMockSupabase()
      const { result } = renderHook(() =>
        usePreviews(supabase as any, 'user-1'),
      )
      await waitForMount(result)

      await act(async () => {
        await result.current.deletePreview(makeMessage())
      })

      expect(result.current.previews).toEqual({})
    })

    it('rebuilds preview from DB when deleting last message', async () => {
      const last = makeMessage({
        id: 'm2',
        updated_at: '2024-01-02T00:00:00Z',
      })

      const previous = makeMessage({
        id: 'm1',
        updated_at: '2024-01-01T00:00:00Z',
      })

      const supabase = createMockSupabase({
        deleteResponse: {
          data: previous,
          error: null,
        },
      })

      const { result } = renderHook(() =>
        usePreviews(supabase as any, 'user-1'),
      )
      await waitForMount(result)

      act(() => {
        result.current.updatePreview(last)
      })

      await act(async () => {
        await result.current.deletePreview(last)
      })

      expect(result.current.previews['user-2']).toEqual(
        derivePreview(previous, 'user-1'),
      )
    })

    it('removes preview when no previous message exists', async () => {
      const last = makeMessage()
      const supabase = createMockSupabase({
        deleteResponse: {
          data: null,
          error: null,
        },
      })

      const { result } = renderHook(() =>
        usePreviews(supabase as any, 'user-1'),
      )
      await waitForMount(result)

      act(() => {
        result.current.updatePreview(last)
      })

      await act(async () => {
        await result.current.deletePreview(last)
      })

      expect(result.current.previews['user-2']).toBeUndefined()
    })
  })
})

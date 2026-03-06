import { usePreviews } from '@/hooks/use-previews'
import { derivePreview } from '@/lib/previews'
import type { Message } from '@/types/message'
import { createClient } from '@/utils/supabase/client'
import { act, renderHook, waitFor } from '@testing-library/react'

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: <T>(
    selector: (state: { user: { id: string } | null }) => T,
  ): T => selector({ user: { id: 'user-1' } }),
}))

jest.mock('@/lib/dashboard', () => ({
  getPartnerId: (msg: Message, currentUserId: string) =>
    msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id,
}))

jest.mock('@/lib/previews', () => ({
  derivePreview: jest.fn((msg: Message, currentUserId: string) => ({
    text: msg.text,
    updatedAt: msg.updated_at,
    isOwnMsg: msg.sender_id === currentUserId,
  })),
  derivePreviews: jest.fn(() => ({})),
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

function mockSupabaseResponse(response: { data: any[]; error: any }) {
  mockedCreateClient.mockReturnValue({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve(response)),
        })),
      })),
    })),
  } as any)
}

function mockSupabaseDeletePreview(response: {
  data: Message | null
  error: any
}) {
  mockedCreateClient.mockReturnValue({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              maybeSingle: jest.fn(() => Promise.resolve(response)),
            })),
          })),
        })),
      })),
    })),
  } as unknown as ReturnType<typeof createClient>)
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
    mockSupabaseResponse({ data: [], error: null })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => usePreviews())
    expect(result.current.loading).toBe(true)
  })

  it('resolves to empty previews when DB returns no rows', async () => {
    const { result } = renderHook(() => usePreviews())
    await waitForMount(result)

    expect(result.current.previews).toEqual({})
    expect(result.current.error).toBeNull()
  })

  describe('updatePreview', () => {
    it('creates or replaces a preview for the partner', async () => {
      const { result } = renderHook(() => usePreviews())
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
      const { result } = renderHook(() => usePreviews())
      await waitForMount(result)

      const newer = makeMessage({ updated_at: '2024-01-02T00:00:00Z' })
      const older = makeMessage({ updated_at: '2024-01-01T00:00:00Z' })

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
      const { result } = renderHook(() => usePreviews())
      await waitForMount(result)

      await act(async () => {
        await result.current.deletePreview(makeMessage())
      })

      expect(result.current.previews).toEqual({})
    })

    it('rebuilds preview from DB when deleting last message', async () => {
      const last = makeMessage({ id: 'm2', updated_at: '2024-01-02T00:00:00Z' })
      const previous = makeMessage({
        id: 'm1',
        updated_at: '2024-01-01T00:00:00Z',
      })

      const { result } = renderHook(() => usePreviews())
      await waitForMount(result)

      act(() => {
        result.current.updatePreview(last)
      })

      // Re-mock specifically for the deletePreview database call
      mockSupabaseDeletePreview({
        data: previous,
        error: null,
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

      const { result } = renderHook(() => usePreviews())
      await waitForMount(result)

      act(() => {
        result.current.updatePreview(last)
      })

      mockSupabaseDeletePreview({
        data: null,
        error: null,
      })

      await act(async () => {
        await result.current.deletePreview(last)
      })

      expect(result.current.previews['user-2']).toBeUndefined()
    })
  })

  describe('replacePreview', () => {
    it('overwrites preview authoritatively', async () => {
      const { result } = renderHook(() => usePreviews())
      await waitForMount(result)
      const msg = makeMessage()

      act(() => {
        result.current.replacePreview('user-2', msg)
      })

      expect(result.current.previews['user-2']).toEqual(
        derivePreview(msg, 'user-1'),
      )
    })

    it('removes preview when message is null', async () => {
      const { result } = renderHook(() => usePreviews())
      await waitForMount(result)

      act(() => {
        result.current.replacePreview('user-2', null)
      })

      expect(result.current.previews['user-2']).toBeUndefined()
    })
  })
})

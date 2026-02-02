/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePreviews } from '@/hooks/use-previews'
import type { Message } from '@/types/message'
import { createClient } from '@/utils/supabase/client'
import { derivePreview } from '@/lib/previews'

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

function mockSupabaseDeletePreview(response: {
  data: Message | null
  error: null
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

describe('usePreviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts in loading state', () => {
    mockedCreateClient.mockReturnValue({
      from: () => ({
        select: () => ({
          or: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    } as any)

    const { result } = renderHook(() => usePreviews())
    expect(result.current.loading).toBe(true)
  })

  it('resolves to empty previews when DB returns no rows', async () => {
    mockedCreateClient.mockReturnValue({
      from: () => ({
        select: () => ({
          or: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    } as any)

    const { result } = renderHook(() => usePreviews())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.previews).toEqual({})
    expect(result.current.error).toBeNull()
  })

  describe('updatePreview', () => {
    it('creates or replaces a preview for the partner', () => {
      const { result } = renderHook(() => usePreviews())
      const msg = makeMessage()

      act(() => {
        result.current.updatePreview(msg)
      })

      expect(result.current.previews['user-2']).toEqual(
        derivePreview(msg, 'user-1'),
      )
    })

    it('ignores stale updates based on updated_at', () => {
      const { result } = renderHook(() => usePreviews())

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

      mockSupabaseDeletePreview({
        data: previous,
        error: null,
      })

      const { result } = renderHook(() => usePreviews())

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

      mockSupabaseDeletePreview({
        data: null,
        error: null,
      })

      const { result } = renderHook(() => usePreviews())

      act(() => {
        result.current.updatePreview(last)
      })

      await act(async () => {
        await result.current.deletePreview(last)
      })

      expect(result.current.previews['user-2']).toBeUndefined()
    })
  })

  describe('replacePreview', () => {
    it('overwrites preview authoritatively', () => {
      const { result } = renderHook(() => usePreviews())
      const msg = makeMessage()

      act(() => {
        result.current.replacePreview('user-2', msg)
      })

      expect(result.current.previews['user-2']).toEqual(
        derivePreview(msg, 'user-1'),
      )
    })

    it('removes preview when message is null', () => {
      const { result } = renderHook(() => usePreviews())

      act(() => {
        result.current.replacePreview('user-2', null)
      })

      expect(result.current.previews['user-2']).toBeUndefined()
    })
  })
})

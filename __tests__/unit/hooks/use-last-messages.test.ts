import { renderHook, act, waitFor } from '@testing-library/react'
import { useLastMessages } from '@/hooks/use-last-messages'
import { type Message } from '@/types/message'
import { createClient } from '@/utils/supabase/client'

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: <T>(
    selector: (state: { user: { id: string } | null }) => T,
  ): T => selector({ user: { id: 'user-1' } }),
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
}))

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  text: 'hello',
  sender_id: 'user-1',
  receiver_id: 'user-2',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('useLastMessages', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useLastMessages())
    expect(result.current.loading).toBe(true)
  })

  it('resolves to empty lastMessages when DB returns no rows', async () => {
    const { result } = renderHook(() => useLastMessages())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.lastMessages).toEqual({})
    expect(result.current.error).toBeNull()
  })

  describe('onMessageSent', () => {
    it('adds or replaces the last message for the partner', () => {
      const { result } = renderHook(() => useLastMessages())
      const msg = makeMessage()

      act(() => {
        result.current.insertLastMessage(msg)
      })

      expect(result.current.lastMessages['user-2']).toEqual(msg)
    })
  })

  describe('onMessageDeleted', () => {
    it('does nothing if deleted message is not the last message', async () => {
      const { result } = renderHook(() => useLastMessages())

      const msg = makeMessage({ id: 'm1' })

      await act(async () => {
        await result.current.deleteLastMessage(msg)
      })

      expect(result.current.lastMessages).toEqual({})
    })

    it('replaces last message with previous one when deleted message was last', async () => {
      const { result } = renderHook(() => useLastMessages())

      const last = makeMessage({ id: 'm2', text: 'latest' })
      const previous = makeMessage({ id: 'm1', text: 'previous' })

      act(() => {
        result.current.insertLastMessage(last)
      })

      mockedCreateClient.mockReturnValueOnce({
        from: () => ({
          select: () => ({
            or: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [previous], error: null }),
              }),
            }),
          }),
        }),
      } as any)

      await act(async () => {
        await result.current.deleteLastMessage(last)
      })

      expect(result.current.lastMessages['user-2']).toEqual(previous)
    })

    it('removes conversation when deleted message was last and no previous exists', async () => {
      const { result } = renderHook(() => useLastMessages())

      const last = makeMessage({ id: 'm1' })

      act(() => {
        result.current.insertLastMessage(last)
      })

      mockedCreateClient.mockReturnValueOnce({
        from: () => ({
          select: () => ({
            or: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          }),
        }),
      } as any)

      await act(async () => {
        await result.current.deleteLastMessage(last)
      })

      expect(result.current.lastMessages['user-2']).toBeUndefined()
    })
  })

  describe('onMessageUpdated', () => {
    it('updates the last message text and rolls back correctly', () => {
      const { result } = renderHook(() => useLastMessages())
      const original = makeMessage({ id: 'm1', text: 'old' })

      act(() => {
        result.current.insertLastMessage(original)
      })

      let rollback!: () => void
      act(() => {
        rollback = result.current.updateLastMessage('m1', 'new')
      })

      expect(result.current.lastMessages['user-2']?.text).toBe('new')

      act(() => {
        rollback()
      })

      expect(result.current.lastMessages['user-2']?.text).toBe('old')
    })

    it('is a safe no-op when editing a non-last message', () => {
      const { result } = renderHook(() => useLastMessages())

      let rollback!: () => void

      act(() => {
        rollback = result.current.updateLastMessage('unknown', 'new')
      })
      act(() => {
        rollback()
      })

      expect(result.current.lastMessages).toEqual({})
    })
  })

  describe('replaceLastMessage', () => {
    it('overwrites the last message explicitly', () => {
      const { result } = renderHook(() => useLastMessages())
      const msg = makeMessage()

      act(() => {
        result.current.replaceLastMessage('user-2', msg)
      })

      expect(result.current.lastMessages['user-2']).toEqual(msg)
    })

    it('removes the conversation when message is null', () => {
      const { result } = renderHook(() => useLastMessages())

      act(() => {
        result.current.replaceLastMessage('user-2', null)
      })

      expect(result.current.lastMessages['user-2']).toBeUndefined()
    })
  })
})

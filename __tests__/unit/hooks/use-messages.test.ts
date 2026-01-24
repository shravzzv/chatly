import { renderHook, act, waitFor } from '@testing-library/react'
import { useMessages } from '@/hooks/use-messages'
import type { Message } from '@/types/message'

jest.mock('uuid', () => ({
  v4: () => 'temp-id',
}))

jest.mock('@/lib/dashboard', () => ({
  getPartnerId: (msg: Message, currentUserId: string) =>
    msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id,
}))

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: <T>(
    selector: (state: { user: { id: string } | null }) => T,
  ): T => selector({ user: { id: 'user-1' } }),
}))

const insertLastMessage = jest.fn()
const updateLastMessage = jest.fn(() => jest.fn())
const deleteLastMessage = jest.fn()
const replaceLastMessage = jest.fn()

jest.mock('@/hooks/use-last-messages', () => ({
  useLastMessages: () => ({
    lastMessages: {},
    loading: false,
    insertLastMessage,
    updateLastMessage,
    deleteLastMessage,
    replaceLastMessage,
  }),
}))

const mockFrom = jest.fn()
const mockChannelOn = jest.fn().mockReturnThis()
const mockSubscribe = jest.fn()

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    channel: () => ({
      on: mockChannelOn,
      subscribe: mockSubscribe,
    }),
    removeChannel: jest.fn(),
  }),
}))

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  text: 'hello',
  sender_id: 'user-1',
  receiver_id: 'partner-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('useMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization & fetching', () => {
    it('starts in loading state and fetches messages', async () => {
      const msg = makeMessage()

      mockFrom.mockReturnValueOnce({
        select: () => ({
          or: () => ({
            order: async () => ({
              data: [msg],
              error: null,
            }),
          }),
        }),
      })

      const { result } = renderHook(() => useMessages('partner-1'))

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.messages).toEqual([msg])
      expect(result.current.error).toBeNull()
    })

    it('clears messages when selectedProfileId is null', () => {
      const { result } = renderHook(() => useMessages(null))
      expect(result.current.messages).toEqual([])
    })
  })

  describe('sendMessage', () => {
    it('optimistically inserts and replaces with db message on success', async () => {
      const dbMessage = makeMessage({ id: 'real-id' })

      mockFrom
        // 1️⃣ initial fetchMessages
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        // 2️⃣ insert during sendMessage
        .mockReturnValueOnce({
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: dbMessage,
                error: null,
              }),
            }),
          }),
        })

      const { result } = renderHook(() => useMessages('partner-1'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.sendMessage('hello')
      })

      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].id).toBe('real-id')
      expect(insertLastMessage).toHaveBeenCalledTimes(2)
    })

    it('rolls back optimistic insert on failure', async () => {
      mockFrom
        // 1️⃣ initial fetchMessages on mount
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        // 2️⃣ insert during sendMessage (failure)
        .mockReturnValueOnce({
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: null,
                error: new Error('fail'),
              }),
            }),
          }),
        })

      const { result } = renderHook(() => useMessages('partner-1'))

      await act(async () => {
        await result.current.sendMessage('hello')
      })

      expect(result.current.messages).toEqual([])
      expect(replaceLastMessage).toHaveBeenCalled()
    })

    it('is a no-op when text is empty', async () => {
      const { result } = renderHook(() => useMessages('partner-1'))

      await act(async () => {
        await result.current.sendMessage('   ')
      })

      expect(result.current.messages).toEqual([])
      expect(insertLastMessage).not.toHaveBeenCalled()
    })
  })

  describe('editMessage', () => {
    it('optimistically updates and rolls back on failure', async () => {
      const msg = makeMessage({ text: 'old' })

      mockFrom
        // 1️⃣ initial fetchMessages
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        // 2️⃣ update during editMessage (failure)
        .mockReturnValueOnce({
          update: () => ({
            eq: () => ({
              select: () => ({
                single: async () => ({
                  data: null,
                  error: new Error('fail'),
                }),
              }),
            }),
          }),
        })

      const { result } = renderHook(() => useMessages('partner-1'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.messages.push(msg)
      })

      await act(async () => {
        await result.current.editMessage(msg.id, 'new')
      })

      expect(result.current.messages[0].text).toBe('old')
      expect(updateLastMessage).toHaveBeenCalled()
    })

    it('finalizes edit on success', async () => {
      const updated = makeMessage({ text: 'new' })

      mockFrom
        // 1️⃣ initial fetchMessages
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        // 2️⃣ update during editMessage (success)
        .mockReturnValueOnce({
          update: () => ({
            eq: () => ({
              select: () => ({
                single: async () => ({
                  data: updated,
                  error: null,
                }),
              }),
            }),
          }),
        })

      const { result } = renderHook(() => useMessages('partner-1'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.messages.push(makeMessage())
      })

      await act(async () => {
        await result.current.editMessage(updated.id, 'new')
      })

      expect(result.current.messages[0].text).toBe('new')
    })
  })

  describe('deleteMessage', () => {
    it('optimistically deletes and finalizes on success', async () => {
      const msg = makeMessage()

      mockFrom
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          delete: () => ({
            eq: async () => ({
              error: null,
            }),
          }),
        })

      const { result } = renderHook(() => useMessages('partner-1'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.messages.push(msg)
      })

      await act(async () => {
        await result.current.deleteMessage(msg.id)
      })

      expect(result.current.messages).toEqual([])
      expect(deleteLastMessage).toHaveBeenCalledWith(msg)
    })

    it('rolls back delete on failure', async () => {
      const msg = makeMessage()

      mockFrom
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({
                data: [],
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          delete: () => ({
            eq: async () => ({
              error: new Error('fail'),
            }),
          }),
        })

      const { result } = renderHook(() => useMessages('partner-1'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.messages.push(msg)
      })

      await act(async () => {
        await result.current.deleteMessage(msg.id)
      })

      expect(result.current.messages).toHaveLength(1)
    })
  })
})

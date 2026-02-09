import { renderHook, act, waitFor } from '@testing-library/react'
import { useMessages } from '@/hooks/use-messages'
import type { Message } from '@/types/message'
import type { SendMessageInput, UseMessagesArgs } from '@/types/use-messages'
import { checkAndIncrementUsage } from '@/app/actions'

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

jest.mock('@/app/actions', () => ({
  checkAndIncrementUsage: jest.fn().mockResolvedValue(undefined),
}))

const mockedCheckAndIncrementUsage =
  checkAndIncrementUsage as jest.MockedFunction<typeof checkAndIncrementUsage>

const mockFrom = jest.fn()
const mockChannelOn = jest.fn().mockReturnThis()
const mockSubscribe = jest.fn()
const mockRemoveChannel = jest.fn()

const mockInsertSingle = jest.fn()
const mockDeleteEq = jest.fn()

const mockMessageQuery = {
  insert: () => ({
    select: () => ({
      single: mockInsertSingle,
    }),
  }),
  delete: () => ({
    eq: mockDeleteEq,
  }),
}

const mockUpload = jest.fn().mockResolvedValue({
  data: { path: 'real-id/file' },
  error: null,
})

const mockRemove = jest.fn().mockResolvedValue({ error: null })

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    channel: () => ({
      on: mockChannelOn,
      subscribe: mockSubscribe,
    }),
    removeChannel: mockRemoveChannel,
    storage: {
      from: () => ({
        upload: mockUpload,
        remove: mockRemove,
      }),
    },
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

const setup = (overrides: Partial<UseMessagesArgs> = {}) => {
  const updatePreview = jest.fn()
  const deletePreview = jest.fn().mockResolvedValue(undefined)

  const args: UseMessagesArgs = {
    selectedProfileId: 'partner-1',
    updatePreview,
    deletePreview,
    ...overrides,
  }

  const utils = renderHook(() => useMessages(args))

  return { ...utils, updatePreview, deletePreview }
}

describe('useMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization & fetching', () => {
    it('fetches messages on mount', async () => {
      const msg = makeMessage()

      mockFrom.mockReturnValueOnce({
        select: () => ({
          or: () => ({
            order: async () => ({
              data: [
                {
                  ...msg,
                  message_attachments: [],
                },
              ],
              error: null,
            }),
          }),
        }),
      })

      const { result } = setup()

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.messages).toEqual([msg])
      expect(result.current.error).toBeNull()
    })

    it('clears messages when selectedProfileId is null', async () => {
      const { result } = setup({ selectedProfileId: null })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.messages).toEqual([])
    })
  })

  describe('sendMessage', () => {
    it('optimistically inserts and reconciles message on success', async () => {
      const dbMessage = makeMessage({ id: 'real-id' })

      mockFrom
        // fetchMessages
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
        // insert message
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

      const { result, updatePreview } = setup()

      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.sendMessage({ text: 'hello' })
      })

      expect(result.current.messages).toEqual([dbMessage])
      expect(updatePreview).toHaveBeenCalledWith(dbMessage)
    })

    it('rolls back optimistic insert on DB failure', async () => {
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
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: null,
                error: new Error('fail'),
              }),
            }),
          }),
        })

      const { result } = setup()

      await act(async () => {
        await expect(
          result.current.sendMessage({ text: 'hello' }),
        ).rejects.toThrow()
      })

      expect(result.current.messages).toEqual([])
    })

    it('is a no-op when neither text nor file is provided', async () => {
      const { result, updatePreview } = setup()

      await act(async () => {
        await result.current.sendMessage({} as SendMessageInput)
      })

      expect(result.current.messages).toEqual([])
      expect(updatePreview).not.toHaveBeenCalled()
    })

    it('calls checkAndIncrementUsage after successful media upload', async () => {
      const file = new File(['hello'], 'test.txt', { type: 'text/plain' })
      const dbMessage = makeMessage({ id: 'real-id' })
      const attachment = {
        id: 'att-1',
        message_id: 'real-id',
        path: 'real-id/file',
        file_name: 'test.txt',
        mime_type: 'text/plain',
        size: 5,
        created_at: '2024-01-01T00:00:00Z',
      }

      mockInsertSingle
        .mockResolvedValueOnce({ data: dbMessage, error: null }) // message insert
        .mockResolvedValueOnce({ data: attachment, error: null }) // attachment insert

      mockDeleteEq.mockResolvedValue({ error: null })

      mockFrom
        // fetchMessages
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({ data: [], error: null }),
            }),
          }),
        })
        // message + attachment queries
        .mockReturnValue(mockMessageQuery)

      const { result } = setup()
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.sendMessage({ file })
      })

      expect(mockedCheckAndIncrementUsage).toHaveBeenCalledWith('media')
      expect(mockedCheckAndIncrementUsage).toHaveBeenCalledTimes(1)
    })

    it('rolls back message when checkAndIncrementUsage fails after upload', async () => {
      const file = new File(['hello'], 'test.txt', { type: 'text/plain' })
      const dbMessage = makeMessage({ id: 'real-id' })
      const attachment = {
        id: 'att-1',
        message_id: 'real-id',
        path: 'real-id/file',
        file_name: 'test.txt',
        mime_type: 'text/plain',
        size: 5,
        created_at: '2024-01-01T00:00:00Z',
      }

      mockedCheckAndIncrementUsage.mockRejectedValueOnce(
        new Error('USAGE_LIMIT_EXCEEDED'),
      )

      mockInsertSingle
        .mockResolvedValueOnce({ data: dbMessage, error: null }) // message insert
        .mockResolvedValueOnce({ data: attachment, error: null }) // attachment insert

      mockDeleteEq.mockResolvedValue({ error: null })

      mockFrom
        // fetchMessages
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({ data: [], error: null }),
            }),
          }),
        })
        // message + attachment queries
        .mockReturnValue(mockMessageQuery)

      const { result } = setup()
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await expect(result.current.sendMessage({ file })).rejects.toThrow(
          'USAGE_LIMIT_EXCEEDED',
        )
      })

      // optimistic message is rolled back
      expect(result.current.messages).toEqual([])

      // usage was attempted
      expect(mockedCheckAndIncrementUsage).toHaveBeenCalledWith('media')
      expect(mockedCheckAndIncrementUsage).toHaveBeenCalledTimes(1)
    })
  })

  describe('editMessage', () => {
    it('optimistically edits and rolls back on failure', async () => {
      const msg = makeMessage({ text: 'old' })

      mockFrom
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({
                data: [{ ...msg, message_attachments: [] }],
                error: null,
              }),
            }),
          }),
        })
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

      const { result } = setup()

      await waitFor(() => expect(result.current.messages.length).toBe(1))

      await act(async () => {
        await expect(
          result.current.editMessage(msg.id, 'new'),
        ).rejects.toThrow()
      })

      expect(result.current.messages[0].text).toBe('old')
    })

    it('finalizes edit on success', async () => {
      const msg = makeMessage()
      const updated = { ...msg, text: 'new' }

      mockFrom
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({
                data: [{ ...msg, message_attachments: [] }],
                error: null,
              }),
            }),
          }),
        })
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

      const { result, updatePreview } = setup()

      await waitFor(() => expect(result.current.messages.length).toBe(1))

      await act(async () => {
        await result.current.editMessage(msg.id, 'new')
      })

      expect(result.current.messages[0].text).toBe('new')
      expect(updatePreview).toHaveBeenCalledWith(updated)
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
                data: [{ ...msg, message_attachments: [] }],
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

      const { result, deletePreview } = setup()

      await waitFor(() => expect(result.current.messages.length).toBe(1))

      await act(async () => {
        await result.current.deleteMessage(msg.id)
      })

      expect(result.current.messages).toEqual([])
      expect(deletePreview).toHaveBeenCalledWith(msg)
    })

    it('rolls back delete on failure', async () => {
      const msg = makeMessage()

      mockFrom
        .mockReturnValueOnce({
          select: () => ({
            or: () => ({
              order: async () => ({
                data: [{ ...msg, message_attachments: [] }],
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

      const { result } = setup()

      await waitFor(() => expect(result.current.messages.length).toBe(1))

      await act(async () => {
        await expect(result.current.deleteMessage(msg.id)).rejects.toThrow()
      })

      expect(result.current.messages.length).toBe(1)
    })
  })
})

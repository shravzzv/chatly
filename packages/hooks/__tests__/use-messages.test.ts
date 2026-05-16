import { useMessages } from '@chatly/hooks/use-messages'
import type { Message } from '@chatly/types/message'
import type { MessageAttachment } from '@chatly/types/message-attachment'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { SendMessageInput, UseMessagesArgs } from '../types/use-messages'

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  text: 'hello',
  sender_id: 'user-1',
  receiver_id: 'partner-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

function createSupabaseMock() {
  const realtimeHandlers: Record<string, Function> = {}

  const mockFrom = jest.fn()

  const mockUpload = jest.fn().mockResolvedValue({
    data: { path: 'real-id/file' },
    error: null,
  })

  const mockRemove = jest.fn().mockResolvedValue({
    error: null,
  })

  const mockInvoke = jest.fn()

  type ChannelMock = {
    on: jest.Mock
    subscribe: jest.Mock
  }

  const channelMock = {} as ChannelMock

  channelMock.on = jest.fn((type: any, filter: any, callback: any) => {
    const key =
      type === 'postgres_changes' ? `${filter.table}:${filter.event}` : type

    realtimeHandlers[key] = callback

    return channelMock
  })

  channelMock.subscribe = jest.fn(() => channelMock)

  const supabase = {
    from: mockFrom,

    channel: jest.fn(() => channelMock),

    removeChannel: jest.fn(),

    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
      })),
    },

    functions: {
      invoke: mockInvoke,
    },
  }

  return {
    supabase,
    mockFrom,
    mockUpload,
    mockRemove,
    mockInvoke,
    realtimeHandlers,
  }
}

function setup({
  overrides = {},
  configureMocks,
}: {
  overrides?: Partial<UseMessagesArgs>
  configureMocks?: (mockFrom: jest.Mock) => void
} = {}) {
  const updatePreview = jest.fn()

  const deletePreview = jest.fn().mockResolvedValue(undefined)

  const {
    supabase,
    mockFrom,
    mockUpload,
    mockRemove,
    mockInvoke,
    realtimeHandlers,
  } = createSupabaseMock()

  configureMocks?.(mockFrom)

  const args: UseMessagesArgs = {
    supabase: supabase as any,
    currentUserId: 'user-1',
    selectedProfileId: 'partner-1',

    updatePreview,
    deletePreview,

    generateId: jest.fn(() => 'temp-id'),

    ...overrides,
  }

  const utils = renderHook(() => useMessages(args))

  return {
    ...utils,
    supabase,
    mockFrom,
    mockUpload,
    mockRemove,
    mockInvoke,
    realtimeHandlers,
    updatePreview,
    deletePreview,
  }
}

describe('useMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialization & fetching', () => {
    it('fetches messages on mount', async () => {
      const msg = makeMessage()

      const { result } = setup({
        configureMocks: (mockFrom) => {
          mockFrom.mockReturnValue({
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
        },
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.messages).toEqual([msg])
      expect(result.current.error).toBeNull()
    })

    it('clears messages when selectedProfileId is null', async () => {
      const { result } = setup({
        overrides: {
          selectedProfileId: null,
        },
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.messages).toEqual([])
    })
  })

  describe('sendMessage', () => {
    it('optimistically inserts and reconciles message on success', async () => {
      const dbMessage = makeMessage({
        id: 'real-id',
      })

      const { result, updatePreview } = setup({
        configureMocks: (mockFrom) => {
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
                    data: dbMessage,
                    error: null,
                  }),
                }),
              }),
            })
        },
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.sendMessage({
          text: 'hello',
        })
      })

      expect(result.current.messages).toEqual([dbMessage])

      expect(updatePreview).toHaveBeenCalledWith(dbMessage)
    })

    it('rolls back optimistic insert on DB failure', async () => {
      const { result } = setup({
        configureMocks: (mockFrom) => {
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
        },
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await expect(
          result.current.sendMessage({
            text: 'hello',
          }),
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

    it('calls edge function after successful file upload', async () => {
      const file = new File(['hello'], 'test.txt', {
        type: 'text/plain',
      })

      const dbMessage = makeMessage({
        id: 'real-id',
      })

      const attachment: MessageAttachment = {
        id: 'att-1',
        message_id: 'real-id',
        path: 'real-id/file',
        file_name: 'test.txt',
        mime_type: 'text/plain',
        size: 5,
        created_at: '2024-01-01T00:00:00Z',
      }

      const { result, mockInvoke } = setup({
        configureMocks: (mockFrom) => {
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
                    data: dbMessage,
                    error: null,
                  }),
                }),
              }),
            })
        },
      })

      mockInvoke.mockResolvedValueOnce({
        data: { attachment },
        error: null,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.sendMessage({ file })
      })

      expect(mockInvoke).toHaveBeenCalledWith(
        'create-msg-attachment',
        expect.objectContaining({
          body: expect.objectContaining({
            messageId: 'real-id',
          }),
        }),
      )

      expect(result.current.messages[0].attachment).toEqual(attachment)
    })

    it('rolls back message when edge function fails', async () => {
      const file = new File(['hello'], 'test.txt', {
        type: 'text/plain',
      })

      const dbMessage = makeMessage({
        id: 'real-id',
      })

      const { result, mockInvoke } = setup({
        configureMocks: (mockFrom) => {
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
                    data: dbMessage,
                    error: null,
                  }),
                }),
              }),
            })
            .mockReturnValue({
              delete: () => ({
                eq: jest.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            })
        },
      })

      mockInvoke.mockResolvedValueOnce({
        data: {
          error: 'USAGE_LIMIT_EXCEEDED',
        },
        error: null,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.sendMessage({ file })).rejects.toThrow(
          'USAGE_LIMIT_EXCEEDED',
        )
      })

      expect(result.current.messages).toEqual([])
    })
  })

  describe('editMessage', () => {
    it('optimistically edits and rolls back on failure', async () => {
      const msg = makeMessage({
        text: 'old',
      })

      const { result } = setup({
        configureMocks: (mockFrom) => {
          mockFrom
            .mockReturnValueOnce({
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
        },
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBe(1)
      })

      await act(async () => {
        await expect(
          result.current.editMessage(msg.id, 'new'),
        ).rejects.toThrow()
      })

      expect(result.current.messages[0].text).toBe('old')
    })

    it('finalizes edit on success', async () => {
      const msg = makeMessage()

      const updated = {
        ...msg,
        text: 'new',
      }

      const { result, updatePreview } = setup({
        configureMocks: (mockFrom) => {
          mockFrom
            .mockReturnValueOnce({
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
        },
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBe(1)
      })

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

      const { result, deletePreview } = setup({
        configureMocks: (mockFrom) => {
          mockFrom
            .mockReturnValueOnce({
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
            .mockReturnValueOnce({
              delete: () => ({
                eq: async () => ({
                  error: null,
                }),
              }),
            })
        },
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBe(1)
      })

      await act(async () => {
        await result.current.deleteMessage(msg.id)
      })

      expect(result.current.messages).toEqual([])
      expect(deletePreview).toHaveBeenCalledWith(msg)
    })

    it('rolls back delete on failure', async () => {
      const msg = makeMessage()

      const { result } = setup({
        configureMocks: (mockFrom) => {
          mockFrom
            .mockReturnValueOnce({
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
            .mockReturnValueOnce({
              delete: () => ({
                eq: async () => ({
                  error: new Error('fail'),
                }),
              }),
            })
        },
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBe(1)
      })

      await act(async () => {
        await expect(result.current.deleteMessage(msg.id)).rejects.toThrow()
      })

      expect(result.current.messages.length).toBe(1)
    })
  })

  describe('realtime', () => {
    it('hydrates attachment via realtime', async () => {
      const msg = makeMessage({
        id: 'msg-1',
      })

      const attachment: MessageAttachment = {
        id: 'att-1',
        message_id: 'msg-1',
        path: 'path',
        file_name: 'file.txt',
        mime_type: 'text/plain',
        size: 1,
        created_at: '2024-01-01',
      }

      const { result, realtimeHandlers } = setup()

      await act(async () => {
        realtimeHandlers['messages:*']?.({
          eventType: 'INSERT',
          new: msg,
        })
      })

      await act(async () => {
        realtimeHandlers['message_attachments:*']?.({
          eventType: 'INSERT',
          new: attachment,
        })
      })

      expect(result.current.messages[0].attachment).toEqual(attachment)
    })
  })
})

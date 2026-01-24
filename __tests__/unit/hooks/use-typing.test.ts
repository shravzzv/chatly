import { renderHook, act } from '@testing-library/react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useTyping } from '@/hooks/use-typing'

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: <T>(
    selector: (state: { user: { id: string } | null }) => T,
  ): T => selector({ user: { id: 'user-1' } }),
}))

let presenceState: any = {}
const track = jest.fn()
const on = jest.fn().mockReturnThis()
const subscribe = jest.fn((cb) => {
  cb('SUBSCRIBED')
  return undefined
})

const mockChannel: Partial<RealtimeChannel> = {
  on,
  subscribe,
  track,
  presenceState: () => presenceState,
}

const removeChannel = jest.fn()

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    channel: () => mockChannel,
    removeChannel,
  }),
}))

describe('useTyping', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    presenceState = {}
  })

  it('returns isTyping = false by default', () => {
    const { result } = renderHook(() => useTyping('user-2'))

    expect(result.current.isTyping).toBe(false)
  })

  it('returns true when partner is typing to the current user', () => {
    presenceState = {
      'user-2': [
        {
          user_id: 'user-2',
          typing_to: 'user-1',
        },
      ],
    }

    const { result } = renderHook(() => useTyping('user-2'))

    // trigger presence sync
    act(() => {
      const syncHandler = on.mock.calls.find(
        ([event]) => event === 'presence',
      )?.[2]

      syncHandler?.()
    })

    expect(result.current.isTyping).toBe(true)
  })

  it('ignores users typing to someone else', () => {
    presenceState = {
      'user-2': [
        {
          user_id: 'user-2',
          typing_to: 'someone-else',
        },
      ],
    }

    const { result } = renderHook(() => useTyping('user-2'))

    act(() => {
      const syncHandler = on.mock.calls.find(
        ([event]) => event === 'presence',
      )?.[2]

      syncHandler?.()
    })

    expect(result.current.isTyping).toBe(false)
  })

  describe('updateTypingStatus', () => {
    it('tracks typing when set to true', async () => {
      const { result } = renderHook(() => useTyping('user-2'))

      await act(async () => {
        await result.current.updateTypingStatus(true)
      })

      expect(track).toHaveBeenCalledWith({
        user_id: 'user-1',
        typing_to: 'user-2',
      })
    })

    it('clears typing when set to false', async () => {
      const { result } = renderHook(() => useTyping('user-2'))

      await act(async () => {
        await result.current.updateTypingStatus(false)
      })

      expect(track).toHaveBeenCalledWith({
        user_id: 'user-1',
        typing_to: null,
      })
    })

    it('no-ops when partnerId is null', async () => {
      const { result } = renderHook(() => useTyping(null))

      // clear the initial SUBSCRIBED track() call
      track.mockClear()

      await act(async () => {
        await result.current.updateTypingStatus(true)
      })

      expect(track).not.toHaveBeenCalled()
    })
  })

  it('cleans up channel on unmount', () => {
    const { unmount } = renderHook(() => useTyping('user-2'))

    unmount()

    expect(removeChannel).toHaveBeenCalled()
  })
})

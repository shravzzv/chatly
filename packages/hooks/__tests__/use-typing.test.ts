import { useTyping } from '@chatly/hooks/use-typing'
import { act, renderHook } from '@testing-library/react'

let presenceState: any = {}
let presenceHandler: (() => void) | undefined

const track = jest.fn()

type MockChannel = {
  on: jest.Mock
  subscribe: jest.Mock
  track: jest.Mock
  presenceState: () => any
}

let channelMock: MockChannel

const supabaseMock = {
  channel: jest.fn(() => channelMock),
  removeChannel: jest.fn(),
}

describe('useTyping', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    presenceState = {}
    presenceHandler = undefined

    channelMock = {
      on: jest.fn((_type, _filter, cb) => {
        presenceHandler = cb as () => void
        return channelMock
      }),

      subscribe: jest.fn((cb?: (status: string) => void) => {
        cb?.('SUBSCRIBED')
        return channelMock
      }),

      track,

      presenceState: () => presenceState,
    }
  })

  it('returns isTyping as false by default', () => {
    const { result } = renderHook(() =>
      useTyping(supabaseMock as any, 'user-1', 'user-2'),
    )

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

    const { result } = renderHook(() =>
      useTyping(supabaseMock as any, 'user-1', 'user-2'),
    )

    act(() => {
      presenceHandler?.()
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

    const { result } = renderHook(() =>
      useTyping(supabaseMock as any, 'user-1', 'user-2'),
    )

    act(() => {
      presenceHandler?.()
    })

    expect(result.current.isTyping).toBe(false)
  })

  describe('updateTypingStatus', () => {
    it('tracks typing when set to true', async () => {
      const { result } = renderHook(() =>
        useTyping(supabaseMock as any, 'user-1', 'user-2'),
      )

      await act(async () => {
        await result.current.updateTypingStatus(true)
      })

      expect(track).toHaveBeenCalledWith({
        user_id: 'user-1',
        typing_to: 'user-2',
      })
    })

    it('clears typing when set to false', async () => {
      const { result } = renderHook(() =>
        useTyping(supabaseMock as any, 'user-1', 'user-2'),
      )

      await act(async () => {
        await result.current.updateTypingStatus(false)
      })

      expect(track).toHaveBeenCalledWith({
        user_id: 'user-1',
        typing_to: null,
      })
    })

    it('no-ops when partnerId is null', async () => {
      const { result } = renderHook(() =>
        useTyping(supabaseMock as any, 'user-1', null),
      )

      track.mockClear()

      await act(async () => {
        await result.current.updateTypingStatus(true)
      })

      expect(track).not.toHaveBeenCalled()
    })

    it('no-ops when currentUserId is null', async () => {
      const { result } = renderHook(() =>
        useTyping(supabaseMock as any, null, 'user-2'),
      )

      track.mockClear()

      await act(async () => {
        await result.current.updateTypingStatus(true)
      })

      expect(track).not.toHaveBeenCalled()
    })
  })

  it('cleans up channel on unmount', () => {
    const { unmount } = renderHook(() =>
      useTyping(supabaseMock as any, 'user-1', 'user-2'),
    )

    unmount()

    expect(supabaseMock.removeChannel).toHaveBeenCalled()
  })
})

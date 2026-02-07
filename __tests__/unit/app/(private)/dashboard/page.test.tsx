import { render } from '@testing-library/react'
import Dashboard from '@/app/(private)/dashboard/page'
import { getCheckoutUrl } from '@/lib/get-checkout-url'
import { useChatlyStore } from '@/providers/chatly-store-provider'

const replaceMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'plan') return 'pro'
      if (key === 'billing') return 'monthly'
      return null
    },
  }),
}))

jest.mock('@/lib/get-checkout-url', () => ({
  getCheckoutUrl: jest.fn(),
}))

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: jest.fn(),
}))

jest.mock('@/hooks/use-profiles', () => ({
  useProfiles: () => ({
    profiles: [],
    filteredProfiles: [],
    loading: false,
  }),
}))

jest.mock('@/hooks/use-messages', () => ({
  useMessages: () => ({
    messages: [],
    loading: false,
    sendMessage: jest.fn(),
    deleteMessage: jest.fn(),
    editMessage: jest.fn(),
    lastMessages: {},
    lastMessagesLoading: false,
  }),
}))

jest.mock('@/components/chat-panel', () => {
  const ChatPanelMock = () => <div />
  ChatPanelMock.displayName = 'ChatPanel'
  return ChatPanelMock
})

jest.mock('@/components/conversations-panel', () => {
  const ConversationsPanelMock = () => <div />
  ConversationsPanelMock.displayName = 'ConversationsPanel'
  return ConversationsPanelMock
})

jest.mock('@/components/conversation-select-dialog', () => {
  const ConversationSelectDialogMock = () => <div />
  ConversationSelectDialogMock.displayName = 'ConversationSelectDialog'
  return ConversationSelectDialogMock
})

jest.mock('@/app/actions', () => ({
  enhanceText: jest.fn(),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to checkout when user, plan, and billing exist', () => {
    ;(useChatlyStore as jest.Mock).mockImplementation((selector) =>
      selector({
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      }),
    )
    ;(getCheckoutUrl as jest.Mock).mockReturnValue(
      'https://checkout.example.com',
    )

    render(<Dashboard />)

    expect(getCheckoutUrl).toHaveBeenCalledWith(
      'pro',
      'monthly',
      expect.objectContaining({ id: 'user-1' }),
    )

    expect(replaceMock).toHaveBeenCalledWith('https://checkout.example.com')
  })
})

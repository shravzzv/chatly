import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Page from '@/app/(private)/dashboard/page'

const replace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

jest.mock('@/providers/chatly-store-provider', () => ({
  useChatlyStore: <T,>(
    selector: (state: { user: { id: string; email: string } }) => T,
  ) => selector({ user: { id: 'user-1', email: 'test@test.com' } }),
}))

const mockProfiles = [{ id: '1', user_id: 'user-2', name: 'Alice' }]

jest.mock('@/hooks/use-profiles', () => ({
  useProfiles: () => ({
    profiles: mockProfiles,
    filteredProfiles: mockProfiles,
    loading: false,
  }),
}))

const useMessagesMock = jest.fn()

jest.mock('@/hooks/use-messages', () => ({
  useMessages: (profileId: string | null | undefined) =>
    useMessagesMock(profileId),
}))

interface ConversationsPanelProps {
  setSelectedProfileId: (id: string) => void
}

jest.mock('@/components/conversations-panel', () => ({
  __esModule: true,
  default: ({ setSelectedProfileId }: ConversationsPanelProps) => (
    <button onClick={() => setSelectedProfileId('user-2')}>
      select-profile
    </button>
  ),
}))

interface ChatPanelProps {
  selectedProfile: { user_id: string } | null
}

jest.mock('@/components/chat-panel', () => ({
  __esModule: true,
  default: ({ selectedProfile }: ChatPanelProps) => (
    <div>
      chat-panel
      {selectedProfile && <span>{selectedProfile.user_id}</span>}
    </div>
  ),
}))

jest.mock('@/components/conversation-select-dialog', () => ({
  __esModule: true,
  default: () => null,
}))

describe('Dashboard integration', () => {
  beforeEach(() => {
    useMessagesMock.mockReturnValue({
      messages: [],
      loading: false,
      sendMessage: jest.fn(),
      deleteMessage: jest.fn(),
      editMessage: jest.fn(),
      lastMessages: {},
      lastMessagesLoading: false,
    })
  })

  it('wires selected profile from the conversations panel to the chat panel and the useMessages hook', async () => {
    const user = userEvent.setup()

    render(<Page />)

    // initial render: no senderId in URL
    expect(useMessagesMock).toHaveBeenCalledWith(undefined)

    // user selects a conversation
    await user.click(screen.getByText('select-profile'))

    // hook re-runs with selected profile id
    expect(useMessagesMock).toHaveBeenLastCalledWith('user-2')

    // chat panel receives derived selectedProfile
    expect(screen.getByText('user-2')).toBeInTheDocument()
  })
})

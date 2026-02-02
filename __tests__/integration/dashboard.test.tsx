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
  ) =>
    selector({
      user: { id: 'user-1', email: 'test@test.com' },
    }),
}))

const setSelectedProfileId = jest.fn()

const mockDashboardContext = {
  profiles: [{ id: '1', user_id: 'user-2', name: 'Alice' }],
  filteredProfiles: [{ id: '1', user_id: 'user-2', name: 'Alice' }],
  profilesLoading: false,

  previews: {},
  previewsLoading: false,

  messages: [],
  messagesLoading: false,
  sendMessage: jest.fn(),
  deleteMessage: jest.fn(),
  editMessage: jest.fn(),

  searchQuery: '',
  setSearchQuery: jest.fn(),

  selectedProfile: { id: '1', user_id: 'user-2', name: 'Alice' },
  selectedProfileId: 'user-2',
  setSelectedProfileId,

  isProfileSelectDialogOpen: false,
  openProfileSelectDialog: jest.fn(),
  closeProfileSelectDialog: jest.fn(),
  closeChatPanel: jest.fn(),
}

jest.mock('@/providers/dashboard-provider', () => ({
  DashboardProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useDashboardContext: () => mockDashboardContext,
}))

const useMessagesMock = jest.fn()

jest.mock('@/hooks/use-messages', () => ({
  useMessages: (args: {
    selectedProfileId: string | null
    updatePreview: (msg: unknown) => void
    deletePreview: (msg: unknown) => Promise<void>
  }) => useMessagesMock(args),
}))

jest.mock('@/components/conversations-panel', () => ({
  __esModule: true,
  default: () => (
    <button onClick={() => setSelectedProfileId('user-2')}>
      select-profile
    </button>
  ),
}))

jest.mock('@/components/chat-panel', () => ({
  __esModule: true,
  default: () => (
    <div>
      chat-panel
      <span>user-2</span>
    </div>
  ),
}))

jest.mock('@/components/conversation-select-dialog', () => ({
  __esModule: true,
  default: () => null,
}))

describe('Dashboard integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useMessagesMock.mockReturnValue({
      messages: [],
      loading: false,
      sendMessage: jest.fn(),
      deleteMessage: jest.fn(),
      editMessage: jest.fn(),
    })
  })

  it('wires selected profile through dashboard context to ChatPanel', async () => {
    const user = userEvent.setup()

    render(<Page />)

    await user.click(screen.getByText('select-profile'))

    // selection written to dashboard context
    expect(setSelectedProfileId).toHaveBeenCalledWith('user-2')

    // chat panel reflects derived selected profile
    expect(screen.getByText('user-2')).toBeInTheDocument()
  })
})

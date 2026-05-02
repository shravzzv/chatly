import ChatInput from '@/components/chat-input'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

const sendMessage = jest.fn()
const updateTypingStatus = jest.fn()
const openUpgradeAlertDialog = jest.fn()
const reflectUsageIncrement = jest.fn()
let canUseAiMock = true

jest.mock('@/providers/dashboard-provider', () => ({
  useDashboardContext: () => ({
    sendMessage,
    canUseAi: canUseAiMock,
    openUpgradeAlertDialog,
    reflectUsageIncrement,
  }),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

jest.mock('sonner')

jest.mock('@/components/chat-input-dropdown', () => ({
  __esModule: true,
  default: () => <div data-testid='chat-input-dropdown' />,
}))

const mockInvoke = jest.fn()

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    functions: {
      invoke: mockInvoke,
    },
  }),
}))

const setup = async () => {
  const user = userEvent.setup()
  render(<ChatInput updateTypingStatus={updateTypingStatus} />)

  const textarea = screen.getByPlaceholderText('Type a message...')
  const sendButton = screen.getByLabelText('Send message')
  const enhanceButton = screen.getByLabelText('Enhance message')

  return { user, textarea, sendButton, enhanceButton }
}

describe('ChatInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    canUseAiMock = true
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('basic message sending', () => {
    it('renders input and buttons', () => {
      render(<ChatInput updateTypingStatus={updateTypingStatus} />)

      expect(
        screen.getByPlaceholderText('Type a message...'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Send message')).toBeDisabled()
      expect(screen.getByLabelText('Enhance message')).toBeDisabled()
    })

    it('enables send button when text is entered', async () => {
      const { user, textarea, sendButton } = await setup()

      await user.type(textarea, 'Hello')

      expect(sendButton).toBeEnabled()
    })

    it('sends message on send button click and clears input', async () => {
      const { user, textarea, sendButton } = await setup()

      await user.type(textarea, 'Hello world')
      await user.click(sendButton)

      expect(sendMessage).toHaveBeenCalledWith({ text: 'Hello world' })
      expect(textarea).toHaveValue('')
    })

    it('does not send empty or whitespace-only messages', async () => {
      const { user, textarea, sendButton } = await setup()

      await user.type(textarea, '   ')
      await user.click(sendButton)

      expect(sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('keyboard and typing behavior', () => {
    it('sends message on Enter key press', async () => {
      const { user, textarea } = await setup()

      await user.type(textarea, 'Hello{enter}')

      expect(sendMessage).toHaveBeenCalledWith({ text: 'Hello' })
    })

    it('does not send message on Shift+Enter', async () => {
      const { user, textarea } = await setup()

      await user.type(textarea, 'Hello{shift>}{enter}{/shift}')

      expect(sendMessage).not.toHaveBeenCalled()
      expect(textarea).toHaveValue('Hello\n')
    })

    it('calls updateTypingStatus(true) when user starts typing', async () => {
      const { user, textarea } = await setup()

      await user.type(textarea, 'H')

      expect(updateTypingStatus).toHaveBeenCalledWith(true)
    })

    it('calls updateTypingStatus(false) when input is cleared', async () => {
      const { user, textarea } = await setup()

      await user.type(textarea, 'Hello')
      await user.clear(textarea)

      expect(updateTypingStatus).toHaveBeenCalledWith(false)
    })
  })

  describe('message enhancement', () => {
    it('enhances message text when clicking enhance button', async () => {
      mockInvoke.mockResolvedValue({
        data: { enhancedText: 'Hello world' },
        error: null,
      })

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Helo world')
      await user.click(enhanceButton)

      mockInvoke.mockResolvedValue({
        data: { enhancedText: 'Hello world' },
        error: null,
      })
      expect(textarea).toHaveValue('Hello world')
    })

    it('disables input and buttons while enhancing', async () => {
      let resolveEnhance!: (v: any) => void

      mockInvoke.mockImplementation(
        () =>
          new Promise((res) => {
            resolveEnhance = res
          }),
      )

      const { user, textarea, enhanceButton, sendButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(textarea).toBeDisabled()
      expect(enhanceButton).toBeDisabled()
      expect(sendButton).toBeDisabled()

      await act(async () => {
        resolveEnhance({ data: { enhancedText: 'Hello!' }, error: null })
      })
    })

    it('shows success toast with Undo action when enhancement changes text', async () => {
      mockInvoke.mockResolvedValue({
        data: { enhancedText: 'Hello!' },
        error: null,
      })

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(toast.success).toHaveBeenCalled()

      const toastOptions = (toast.success as jest.Mock).mock.calls[0][1]
      const action = toastOptions.action

      // Render the action JSX
      const { getByRole } = render(action)

      expect(getByRole('button', { name: /undo/i })).toBeInTheDocument()
    })

    it('undo restores the original message', async () => {
      mockInvoke.mockResolvedValue({
        data: { enhancedText: 'Hello!' },
        error: null,
      })

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      const toastCall = (toast.success as jest.Mock).mock.calls[0][1]
      const UndoButton = toastCall.action

      // Render and click Undo
      const { getByRole } = render(UndoButton)
      await user.click(getByRole('button', { name: /undo/i }))

      expect(textarea).toHaveValue('Hello')
    })

    it('shows error toast if enhancement fails', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'AI_SERVICE_ERROR' },
        error: null,
      })

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(toast.error).toHaveBeenCalledWith('AI enhancement failed')
      expect(textarea).toHaveValue('Hello')
    })

    it('opens upgrade dialog instead of enhancing when AI usage is not allowed', async () => {
      canUseAiMock = false

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(openUpgradeAlertDialog).toHaveBeenCalledWith('ai')
      expect(mockInvoke).not.toHaveBeenCalled()
    })

    it('shows usage limit toast when AI daily limit is exceeded', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'USAGE_LIMIT_EXCEEDED' },
        error: null,
      })

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(toast.error).toHaveBeenCalledWith(
        'Daily AI enhancements limit reached',
      )
    })

    it('shows upgrade toast when server reports free plan', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'USER_ON_FREE_PLAN' },
        error: null,
      })

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(toast.error).toHaveBeenCalledWith(
        'Upgrade your plan to use AI enhancements',
      )
    })

    it('reflects AI usage increment after successful enhancement', async () => {
      mockInvoke.mockResolvedValue({
        data: { enhancedText: 'Hello world' },
        error: null,
      })

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(reflectUsageIncrement).toHaveBeenCalledWith('ai')
    })
  })
})

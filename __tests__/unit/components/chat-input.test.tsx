import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from '@/components/chat-input'
import { toast } from 'sonner'
import { enhanceText } from '@/app/actions'

const sendMessage = jest.fn()
const updateTypingStatus = jest.fn()

jest.mock('@/providers/dashboard-provider', () => ({
  useDashboardContext: () => ({
    sendMessage,
  }),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

jest.mock('@/app/actions', () => ({
  enhanceText: jest.fn(),
}))

jest.mock('sonner')

jest.mock('@/components/chat-input-dropdown', () => ({
  __esModule: true,
  default: () => <div data-testid='chat-input-dropdown' />,
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
      ;(enhanceText as jest.Mock).mockResolvedValue('Hello world')

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Helo world')
      await user.click(enhanceButton)

      expect(enhanceText).toHaveBeenCalledWith('Helo world')
      expect(textarea).toHaveValue('Hello world')
    })

    it('disables input and buttons while enhancing', async () => {
      let resolveEnhance!: (v: string) => void
      ;(enhanceText as jest.Mock).mockImplementation(
        () => new Promise((res) => (resolveEnhance = res)),
      )

      const { user, textarea, enhanceButton, sendButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(textarea).toBeDisabled()
      expect(enhanceButton).toBeDisabled()
      expect(sendButton).toBeDisabled()

      await act(async () => {
        resolveEnhance('Hello!')
      })
    })

    it('shows "Already looks good" toast if enhancement returns same text', async () => {
      ;(enhanceText as jest.Mock).mockResolvedValue('Hello')

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(toast.message).toHaveBeenCalledWith('Already looks good ✨')
    })

    it('shows success toast with Undo action when enhancement changes text', async () => {
      ;(enhanceText as jest.Mock).mockResolvedValue('Hello!')

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
      ;(enhanceText as jest.Mock).mockResolvedValue('Hello!')

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
      ;(enhanceText as jest.Mock).mockRejectedValue(new Error('AI error'))

      const { user, textarea, enhanceButton } = await setup()

      await user.type(textarea, 'Hello')
      await user.click(enhanceButton)

      expect(toast.error).toHaveBeenCalledWith('AI enhancement failed')
      expect(textarea).toHaveValue('Hello')
    })
  })
})

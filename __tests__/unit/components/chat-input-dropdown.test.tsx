import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInputDropdown from '@/components/chat-input-dropdown'
import { MAX_MESSAGE_ATTACHMENT_SIZE } from '@/data/constants'
import { toast } from 'sonner'

const sendMessage = jest.fn()
const openUpgradeAlertDialog = jest.fn()
const reflectUsageIncrement = jest.fn()
let canUseMediaMock = true

jest.mock('@/providers/dashboard-provider', () => ({
  useDashboardContext: () => ({
    sendMessage,
    canUseMedia: canUseMediaMock,
    openUpgradeAlertDialog,
    reflectUsageIncrement,
    mediaUsed: 0,
    mediaRemaining: 5,
    plan: 'free',
  }),
}))

jest.mock('sonner')

describe('ChatInputDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    canUseMediaMock = true
  })

  it('opens the attachments dropdown', async () => {
    const user = userEvent.setup()
    render(<ChatInputDropdown />)

    await user.click(screen.getByLabelText('Add attachment'))

    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
    expect(screen.getByText('Audio')).toBeInTheDocument()
    expect(screen.getByText('File')).toBeInTheDocument()
  })

  it('uploads a valid image attachment', async () => {
    const user = userEvent.setup()
    render(<ChatInputDropdown />)

    await user.click(screen.getByLabelText('Add attachment'))

    const imageInput = document.querySelector(
      'input[type="file"][accept="image/*"]',
    ) as HTMLInputElement

    const file = new File(['image'], 'photo.png', { type: 'image/png' })

    fireEvent.change(imageInput, {
      target: { files: [file] },
    })

    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith({ file })
  })

  it('rejects invalid image file type', async () => {
    const user = userEvent.setup()
    render(<ChatInputDropdown />)

    await user.click(screen.getByLabelText('Add attachment'))

    const imageInput = document.querySelector(
      'input[type="file"][accept="image/*"]',
    ) as HTMLInputElement

    const badFile = new File(['text'], 'file.txt', { type: 'text/plain' })

    fireEvent.change(imageInput, {
      target: { files: [badFile] },
    })

    expect(sendMessage).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalled()
  })

  it('rejects oversized files', async () => {
    const user = userEvent.setup()
    render(<ChatInputDropdown />)

    await user.click(screen.getByLabelText('Add attachment'))

    const fileInput = document.querySelector(
      'input[type="file"][accept="*"]',
    ) as HTMLInputElement

    const bigFile = new File(
      [new ArrayBuffer(MAX_MESSAGE_ATTACHMENT_SIZE + 1)],
      'big.zip',
      { type: 'application/zip' },
    )

    fireEvent.change(fileInput, {
      target: { files: [bigFile] },
    })

    expect(sendMessage).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalled()
  })

  it('disables attachment input while uploading', async () => {
    let resolveUpload: () => void

    sendMessage.mockImplementation(
      () => new Promise<void>((res) => (resolveUpload = res)),
    )

    const user = userEvent.setup()
    render(<ChatInputDropdown />)

    await user.click(screen.getByLabelText('Add attachment'))

    const imageInput = document.querySelector(
      'input[type="file"][accept="image/*"]',
    ) as HTMLInputElement

    const file = new File(['image'], 'photo.png', { type: 'image/png' })

    fireEvent.change(imageInput, {
      target: { files: [file] },
    })

    // Button should be disabled during upload
    expect(screen.getByLabelText('Add attachment')).toBeDisabled()

    resolveUpload!()
  })

  it('opens upgrade dialog instead of file picker when media usage is not allowed', async () => {
    canUseMediaMock = false

    const user = userEvent.setup()
    render(<ChatInputDropdown />)

    await user.click(screen.getByLabelText('Add attachment'))
    await user.click(screen.getByText('Image'))

    expect(openUpgradeAlertDialog).toHaveBeenCalledWith('media')
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('shows usage limit toast when server reports daily media limit is exceeded', async () => {
    sendMessage.mockRejectedValueOnce(new Error('USAGE_LIMIT_EXCEEDED'))

    const user = userEvent.setup()
    render(<ChatInputDropdown />)

    await user.click(screen.getByLabelText('Add attachment'))

    const imageInput = document.querySelector(
      'input[type="file"][accept="image/*"]',
    ) as HTMLInputElement

    const file = new File(['image'], 'photo.png', { type: 'image/png' })

    fireEvent.change(imageInput, {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Daily media attachments limit reached',
      )
    })
  })

  it('shows upgrade toast when server reports free plan for media uploads', async () => {
    sendMessage.mockRejectedValueOnce(new Error('USER_ON_FREE_PLAN'))

    const user = userEvent.setup()
    render(<ChatInputDropdown />)

    await user.click(screen.getByLabelText('Add attachment'))

    const imageInput = document.querySelector(
      'input[type="file"][accept="image/*"]',
    ) as HTMLInputElement

    const file = new File(['image'], 'photo.png', { type: 'image/png' })

    fireEvent.change(imageInput, {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Upgrade your plan to send media attachments',
      )
    })
  })

  it('reflects media usage increment after successful upload', async () => {
    const user = userEvent.setup()
    sendMessage.mockResolvedValueOnce(undefined)

    render(<ChatInputDropdown />)

    await user.click(screen.getByLabelText('Add attachment'))
    await user.click(screen.getByText('Image'))

    const imageInput = document.querySelector(
      'input[type="file"][accept="image/*"]',
    ) as HTMLInputElement
    const file = new File(['image'], 'photo.png', { type: 'image/png' })

    fireEvent.change(imageInput, {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith({ file })
    })

    expect(reflectUsageIncrement).toHaveBeenCalledTimes(1)
    expect(reflectUsageIncrement).toHaveBeenCalledWith('media')
  })
})

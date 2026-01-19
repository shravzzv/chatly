import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import AccountPasswordInput from '@/components/account-password-input'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

jest.mock('sonner')

const updateUserMock = jest.fn()

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: updateUserMock,
    },
  }),
}))

describe('AccountPasswordInput', () => {
  it('renders password input and submit button', () => {
    render(<AccountPasswordInput />)

    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /update password/i })
    ).toBeInTheDocument()
  })

  it('disables submit button when form is pristine', () => {
    render(<AccountPasswordInput />)

    expect(
      screen.getByRole('button', { name: /update password/i })
    ).toBeDisabled()
  })

  it('shows validation error for short password', async () => {
    render(<AccountPasswordInput />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/••••••••/i)

    await user.type(input, 'short')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(
      await screen.findByText(/at least 8 characters/i)
    ).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    render(<AccountPasswordInput />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/••••••••/i)
    const toggle = screen.getByRole('button', { name: '', hidden: true })

    expect(input).toHaveAttribute('type', 'password')
    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('submits password and shows success toast', async () => {
    updateUserMock.mockResolvedValue({ error: null })

    render(<AccountPasswordInput />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/••••••••/i)

    await user.type(input, 'valid-password')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({
        password: 'valid-password',
      })
    })

    expect(toast.success).toHaveBeenCalledWith('Password updated successfully')
    expect(input).toHaveValue('')
  })

  it('shows error toast when update fails', async () => {
    updateUserMock.mockResolvedValue({
      error: { message: 'Boom' },
    })

    render(<AccountPasswordInput />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/••••••••/i)

    await user.type(input, 'valid-password')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update password')
    })
  })
})

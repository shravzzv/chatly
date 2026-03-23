import { ResetPasswordForm } from '@/components/reset-password-form'
import { supabase } from '@/lib/supabase'
import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react-native'
import { router } from 'expo-router'

jest.mock('@/lib/supabase')
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: {
    replace: jest.fn(),
  },
}))

const getSessionMock = supabase?.auth.getSession as jest.Mock
const updateUserMock = supabase?.auth.updateUser as jest.Mock
const passwordInputPlaceholder = 'password'
const confirmPasswordInputPlaceholder = 'confirm password'
const submitBtnName = 'Reset password'

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getSessionMock.mockResolvedValue({ data: { session: {} } })
  })

  it('shows loading state initially', () => {
    getSessionMock.mockImplementation(() => new Promise(() => {})) // never resolves

    const { getByText } = render(<ResetPasswordForm />)

    expect(getByText('Verifying your reset link...')).toBeTruthy()
  })

  it('shows invalid session UI when no session exists', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } })

    const { findByText, findByRole } = render(<ResetPasswordForm />)

    expect(await findByText('Reset link expired')).toBeTruthy()
    expect(
      await findByRole('link', { name: 'Request a new link' }),
    ).toBeTruthy()
  })

  it('renders form when session is valid', async () => {
    const { findByPlaceholderText, findByRole, queryByText } = render(
      <ResetPasswordForm />,
    )

    await waitForElementToBeRemoved(() =>
      queryByText('Verifying your reset link...'),
    )

    const passwordInput = await findByPlaceholderText(passwordInputPlaceholder)
    const confirmPasswordInput = await findByPlaceholderText(
      confirmPasswordInputPlaceholder,
    )
    const submitBtn = await findByRole('button', { name: submitBtnName })

    expect(passwordInput).toBeTruthy()
    expect(confirmPasswordInput).toBeTruthy()
    expect(submitBtn).toBeTruthy()
  })

  it('shows validation errors when submitting empty form', async () => {
    const { findByRole, findByText } = render(<ResetPasswordForm />)

    const button = await findByRole('button', { name: submitBtnName })
    fireEvent.press(button)

    expect(
      await findByText('Password must be at least 8 characters long'),
    ).toBeTruthy()
    expect(
      await findByText('Confirm password must be at least 8 characters long'),
    ).toBeTruthy()
  })

  it('shows error when passwords do not match', async () => {
    const { findByPlaceholderText, findByRole, findByText } = render(
      <ResetPasswordForm />,
    )

    fireEvent.changeText(
      await findByPlaceholderText(passwordInputPlaceholder),
      'password123',
    )
    fireEvent.changeText(
      await findByPlaceholderText(confirmPasswordInputPlaceholder),
      'different123',
    )

    fireEvent.press(await findByRole('button', { name: submitBtnName }))

    expect(await findByText("Doesn't match the new password")).toBeTruthy()
  })

  it('submits successfully and redirects', async () => {
    updateUserMock.mockResolvedValue({ error: null })

    const { findByPlaceholderText, findByRole } = render(<ResetPasswordForm />)

    const passwordInput = await findByPlaceholderText(passwordInputPlaceholder)
    const confirmInput = await findByPlaceholderText(
      confirmPasswordInputPlaceholder,
    )

    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.changeText(confirmInput, 'password123')

    const button = await findByRole('button', { name: 'Reset password' })
    fireEvent.press(button)

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({ password: 'password123' })
      expect(router.replace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error when updateUser fails', async () => {
    updateUserMock.mockResolvedValue({
      error: { message: 'fail' },
    })

    const { findByPlaceholderText, findByRole, findByText } = render(
      <ResetPasswordForm />,
    )

    fireEvent.changeText(
      await findByPlaceholderText(passwordInputPlaceholder),
      'password123',
    )
    fireEvent.changeText(
      await findByPlaceholderText(confirmPasswordInputPlaceholder),
      'password123',
    )

    fireEvent.press(await findByRole('button', { name: submitBtnName }))

    expect(
      await findByText('Something went wrong. Please try again.'),
    ).toBeTruthy()
  })
})

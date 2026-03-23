import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { supabase } from '@/lib/supabase'
import { fireEvent, render } from '@testing-library/react-native'

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => ''),
}))
jest.mock('@/lib/supabase')

const resetPasswordForEmailMock = supabase?.auth
  .resetPasswordForEmail as jest.Mock

const submitBtnName = 'Send reset link'
const succesAlertTitle = 'Check your email'
const emailInputPlaceholder = 'm@example.com'
const emailValidationErrorText = 'A valid email is required'

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('renders an email input and a submit button', () => {
    const { getByPlaceholderText, getByRole } = render(<ForgotPasswordForm />)

    const emailInput = getByPlaceholderText(emailInputPlaceholder)
    const submitBtn = getByRole('button', { name: submitBtnName })

    expect(emailInput).toBeTruthy()
    expect(submitBtn).toBeTruthy()
  })

  it('shows validation error when submitted with an empty email', async () => {
    const { getByRole, findByText } = render(<ForgotPasswordForm />)

    const submitBtn = getByRole('button', { name: submitBtnName })
    fireEvent.press(submitBtn)

    expect(await findByText(emailValidationErrorText)).toBeTruthy()
  })

  it.each(['123', 'abcde', 'test@', '@test.com'])(
    'gets submitted only with a valid email',
    async (email) => {
      const { getByPlaceholderText, getByRole, findByText } = render(
        <ForgotPasswordForm />,
      )

      const emailInput = getByPlaceholderText(emailInputPlaceholder)
      const submitBtn = getByRole('button', { name: submitBtnName })

      fireEvent.changeText(emailInput, email)
      fireEvent.press(submitBtn)

      expect(await findByText(emailValidationErrorText)).toBeTruthy()
    },
  )

  it('submits successfully with a valid email & shows a success alert', async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null })
    const { getByPlaceholderText, getByRole, findByText, queryByText } = render(
      <ForgotPasswordForm />,
    )

    const emailInput = getByPlaceholderText(emailInputPlaceholder)
    const submitBtn = getByRole('button', { name: submitBtnName })
    const validEmail = 'valid@email.com'

    fireEvent.changeText(emailInput, validEmail)
    fireEvent.press(submitBtn)

    expect(queryByText(emailValidationErrorText)).toBeNull()
    expect(await findByText(succesAlertTitle)).toBeTruthy()
    expect(resetPasswordForEmailMock).toHaveBeenCalledWith(validEmail, {
      redirectTo: undefined,
    })
  })

  it('alerts with error when resetPasswordForEmail returns an error', async () => {
    resetPasswordForEmailMock.mockResolvedValue({
      error: { message: 'something went wrong' },
    })
    const { getByPlaceholderText, getByRole, findByText } = render(
      <ForgotPasswordForm />,
    )

    const emailInput = getByPlaceholderText(emailInputPlaceholder)
    const submitBtn = getByRole('button', { name: submitBtnName })
    const validEmail = 'valid@email.com'

    fireEvent.changeText(emailInput, validEmail)
    fireEvent.press(submitBtn)

    expect(
      await findByText('Something went wrong. Please try again.'),
    ).toBeTruthy()
  })

  it('disables form after successful submission', async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null })

    const { getByPlaceholderText, getByRole, findByText } = render(
      <ForgotPasswordForm />,
    )

    const input = getByPlaceholderText(emailInputPlaceholder)
    const button = getByRole('button', { name: submitBtnName })

    fireEvent.changeText(input, 'valid@email.com')
    fireEvent.press(button)

    await findByText(succesAlertTitle)
    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
  })

  it('clears previous error on new submission', async () => {
    resetPasswordForEmailMock
      .mockResolvedValueOnce({ error: { message: 'fail' } })
      .mockResolvedValueOnce({ error: null })

    const { getByPlaceholderText, getByRole, findByText, queryByText } = render(
      <ForgotPasswordForm />,
    )

    const input = getByPlaceholderText(emailInputPlaceholder)
    const button = getByRole('button', { name: submitBtnName })

    fireEvent.changeText(input, 'valid@email.com')
    fireEvent.press(button)

    await findByText('Something went wrong. Please try again.')

    fireEvent.press(button)

    await findByText(succesAlertTitle)

    expect(queryByText('Something went wrong. Please try again.')).toBeNull()
  })
})

import { SignUpForm } from '@/components/signup-form'
import { supabase } from '@/lib/supabase'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('@react-native-async-storage/async-storage')
jest.mock('@/lib/supabase')
jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'chatly://'),
}))

const signUpMock = supabase?.auth.signUp as jest.Mock
signUpMock.mockResolvedValue({ data: null, error: {} })

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders email and password inputs, and a submit button', () => {
    const { getByPlaceholderText, getByRole } = render(<SignUpForm />)

    const emailInput = getByPlaceholderText('m@example.com')
    const passwordInput = getByPlaceholderText('password')
    const submitBtn = getByRole('button', { name: 'Continue' })

    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    expect(submitBtn).toBeTruthy()
  })

  it('calls signUp on submitting with valid credentials', async () => {
    signUpMock.mockResolvedValue({ data: {}, error: null })
    const { getByPlaceholderText, getByRole } = render(<SignUpForm />)

    const emailInput = getByPlaceholderText('m@example.com')
    const passwordInput = getByPlaceholderText('password')
    const submitBtn = getByRole('button', { name: 'Continue' })
    const email = 'asdf@asfd.com'
    const password = '12345678'

    fireEvent.changeText(emailInput, email)
    fireEvent.changeText(passwordInput, password)
    fireEvent.press(submitBtn)

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          password,
        }),
      )
    })
  })

  it('shows validation errors on submitting with empty email and password', async () => {
    const { getByRole, getByText } = render(<SignUpForm />)

    const submitBtn = getByRole('button', { name: 'Continue' })
    fireEvent.press(submitBtn)

    await waitFor(() => {
      expect(getByText('A valid email is required')).toBeTruthy()
      expect(getByText('Password is required')).toBeTruthy()
      expect(signUpMock).not.toHaveBeenCalled()
    })
  })

  it('shows email already exists error on submitting with an existing email', async () => {
    signUpMock.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    })

    const { getByPlaceholderText, getByRole, getByText } = render(
      <SignUpForm />,
    )

    const emailInput = getByPlaceholderText('m@example.com')
    const passwordInput = getByPlaceholderText('password')
    const submitBtn = getByRole('button', { name: 'Continue' })

    fireEvent.changeText(emailInput, 'asdfasfd@asasdf.com')
    fireEvent.changeText(passwordInput, '123456789')
    fireEvent.press(submitBtn)

    await waitFor(() => {
      expect(getByText('Email already in use')).toBeTruthy()
    })
  })

  it('shows success alert on successful signup', async () => {
    signUpMock.mockResolvedValue({ data: {}, error: null })

    const { getByPlaceholderText, getByRole, findByText } = render(
      <SignUpForm />,
    )

    fireEvent.changeText(getByPlaceholderText('m@example.com'), 'a@b.com')
    fireEvent.changeText(getByPlaceholderText('password'), '12345678')
    fireEvent.press(getByRole('button', { name: 'Continue' }))

    expect(await findByText('Verification email sent')).toBeTruthy()
  })

  it('shows global error on unknown failure', async () => {
    signUpMock.mockResolvedValue({
      data: null,
      error: { message: 'Something random' },
    })

    const { getByPlaceholderText, getByRole, findByText } = render(
      <SignUpForm />,
    )

    fireEvent.changeText(getByPlaceholderText('m@example.com'), 'a@b.com')
    fireEvent.changeText(getByPlaceholderText('password'), '12345678')
    fireEvent.press(getByRole('button', { name: 'Continue' }))

    expect(
      await findByText('Something went wrong. Please try again.'),
    ).toBeTruthy()
  })

  it('shows loading state while submitting', async () => {
    signUpMock.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 50),
        ),
    )

    const { getByPlaceholderText, getByRole, findByText } = render(
      <SignUpForm />,
    )

    fireEvent.changeText(getByPlaceholderText('m@example.com'), 'a@b.com')
    fireEvent.changeText(getByPlaceholderText('password'), '12345678')
    fireEvent.press(getByRole('button', { name: 'Continue' }))

    expect(await findByText('Creating account...')).toBeTruthy()
  })

  it('resets password but keeps email after success', async () => {
    signUpMock.mockResolvedValue({ data: {}, error: null })

    const { getByPlaceholderText, getByRole, findByText } = render(
      <SignUpForm />,
    )

    const emailInput = getByPlaceholderText('m@example.com')
    const passwordInput = getByPlaceholderText('password')

    fireEvent.changeText(emailInput, 'a@b.com')
    fireEvent.changeText(passwordInput, '12345678')
    fireEvent.press(getByRole('button', { name: 'Continue' }))

    await findByText('Verification email sent')

    expect(emailInput.props.value).toBe('a@b.com')
    expect(passwordInput.props.value).toBe('')
  })
})

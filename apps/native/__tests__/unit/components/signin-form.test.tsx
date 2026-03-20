import { SignInForm } from '@/components/signin-form'
import { supabase } from '@/lib/supabase'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'

jest.mock('@react-native-async-storage/async-storage')
jest.mock('@/lib/supabase')
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: {
    replace: jest.fn(),
  },
}))
jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'chatly://'),
}))
jest.mock('@/assets/images/google.png')
jest.mock('@/assets/images/github.png')
jest.mock('@/assets/images/apple.png')

const signInWithPasswordMock = supabase?.auth.signInWithPassword as jest.Mock

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders email and password inputs, and a submit button', () => {
    const { getByPlaceholderText, getByRole } = render(<SignInForm />)

    const emailInput = getByPlaceholderText('m@example.com')
    const passwordInput = getByPlaceholderText('password')
    const submitBtn = getByRole('button', { name: 'Continue' })

    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    expect(submitBtn).toBeTruthy()
  })

  it('calls signInWithPassword on submitting with valid credentials, and redirects to dashboard', async () => {
    signInWithPasswordMock.mockResolvedValue({ data: {}, error: null })
    const { getByPlaceholderText, getByRole } = render(<SignInForm />)

    const emailInput = getByPlaceholderText('m@example.com')
    const passwordInput = getByPlaceholderText('password')
    const submitBtn = getByRole('button', { name: 'Continue' })
    const email = 'asdf@asfd.com'
    const password = '12345678'

    fireEvent.changeText(emailInput, email)
    fireEvent.changeText(passwordInput, password)
    fireEvent.press(submitBtn)

    await waitFor(() => {
      expect(signInWithPasswordMock).toHaveBeenCalledWith({
        email,
        password,
      })

      expect(router.replace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows validation errors on submitting with empty email and password', async () => {
    const { getByRole, getByText } = render(<SignInForm />)

    const submitBtn = getByRole('button', { name: 'Continue' })
    fireEvent.press(submitBtn)

    await waitFor(() => {
      expect(getByText('A valid email is required')).toBeTruthy()
      expect(getByText('Password is required')).toBeTruthy()
      expect(signInWithPasswordMock).not.toHaveBeenCalled()
    })
  })

  it('shows validation error on invalid email input', async () => {
    const { getByPlaceholderText, getByRole, getByText } = render(
      <SignInForm />,
    )

    const emailInput = getByPlaceholderText('m@example.com')
    const submitBtn = getByRole('button', { name: 'Continue' })

    fireEvent.changeText(emailInput, 'invalid@email')
    fireEvent.press(submitBtn)

    await waitFor(() => {
      expect(getByText('A valid email is required')).toBeTruthy()
    })
  })

  it('shows validation error when password length is < 8', async () => {
    const { getByPlaceholderText, getByRole, getByText } = render(
      <SignInForm />,
    )

    const passwordInput = getByPlaceholderText('password')
    const submitBtn = getByRole('button', { name: 'Continue' })

    fireEvent.changeText(passwordInput, '12345')
    fireEvent.press(submitBtn)

    await waitFor(() => {
      expect(
        getByText('Password must be at least 8 characters long'),
      ).toBeTruthy()
    })
  })

  it('shows authorization error on submitting with incorrect credentials', async () => {
    signInWithPasswordMock.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    })

    const { getByPlaceholderText, getByRole, getByText } = render(
      <SignInForm />,
    )

    const emailInput = getByPlaceholderText('m@example.com')
    const passwordInput = getByPlaceholderText('password')
    const submitBtn = getByRole('button', { name: 'Continue' })

    fireEvent.changeText(emailInput, 'asdfasfd@asasdf.com')
    fireEvent.changeText(passwordInput, '123456789')
    fireEvent.press(submitBtn)

    await waitFor(() => {
      expect(getByText('Sign in failed')).toBeTruthy()
      expect(
        getByText('Check your email and password and try again.'),
      ).toBeTruthy()
      expect(router.replace).not.toHaveBeenCalled()
    })
  })

  it('contains links to signup and forgot password screens', () => {
    const { getByRole } = render(<SignInForm />)

    const signupLink = getByRole('link', { name: 'Sign up' })
    const forgotPwdLink = getByRole('link', { name: 'Forgot your password?' })

    expect(signupLink).toBeTruthy()
    expect(forgotPwdLink).toBeTruthy()
  })

  it('shows loading state while submitting', async () => {
    signInWithPasswordMock.mockImplementation(
      () => new Promise((resolve) => () => resolve({ data: {}, error: null })),
    )

    const { getByPlaceholderText, getByRole, findByText } = render(
      <SignInForm />,
    )

    const emailInput = getByPlaceholderText('m@example.com')
    const passwordInput = getByPlaceholderText('password')
    const submitBtn = getByRole('button', { name: 'Continue' })

    fireEvent.changeText(emailInput, 'asdf@asdf.com')
    fireEvent.changeText(passwordInput, '123456789')
    fireEvent.press(submitBtn)

    expect(await findByText('Signing in...')).toBeTruthy()
  })
})

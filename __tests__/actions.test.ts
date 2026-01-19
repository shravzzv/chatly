import {
  signup,
  signin,
  signInWithProvider,
  sendPasswordResetEmail,
  updatePassword,
  subscribeUser,
  unsubscribeUser,
  updateProfile,
  deleteUser,
  getSubscriptions,
} from '@/app/actions'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

jest.mock('@/utils/supabase/server')
jest.mock('@/utils/supabase/admin')
jest.mock('next/navigation')

describe('signup', () => {
  const signUpMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { signUp: signUpMock },
    })
  })

  it('calls Supabase signUp with email redirect', async () => {
    signUpMock.mockResolvedValue({ error: null })

    const formData = new FormData()
    formData.set('email', 'test@test.com')
    formData.set('password', 'password')

    await signup(formData)

    expect(signUpMock).toHaveBeenCalled()
  })

  it('redirects to error on failure', async () => {
    signUpMock.mockResolvedValue({ error: new Error('fail') })

    await signup(new FormData())

    expect(redirect).toHaveBeenCalledWith('/error')
  })
})

describe('signin', () => {
  const signInMock = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { signInWithPassword: signInMock },
    })
  })

  it('redirects on successful sign in', async () => {
    signInMock.mockResolvedValue({ error: null })

    const formData = new FormData()
    formData.set('email', 'a@a.com')
    formData.set('password', '123')

    await signin(formData)

    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('returns error message on failure', async () => {
    signInMock.mockResolvedValue({ error: { message: 'bad creds' } })

    const result = await signin(new FormData())

    expect(result?.error).toBe('bad creds')
  })
})

describe('signInWithProvider', () => {
  const oauthMock = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { signInWithOAuth: oauthMock },
    })
  })

  it('redirects to provider URL', async () => {
    oauthMock.mockResolvedValue({
      data: { url: 'https://provider.com' },
      error: null,
    })

    await signInWithProvider('google')

    expect(redirect).toHaveBeenCalledWith('https://provider.com')
  })

  it('redirects to error on failure', async () => {
    oauthMock.mockResolvedValue({ error: new Error('fail') })

    await signInWithProvider('google')

    expect(redirect).toHaveBeenCalledWith('/error')
  })
})

describe('sendPasswordResetEmail', () => {
  const resetMock = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { resetPasswordForEmail: resetMock },
    })
  })

  it('sends reset email', async () => {
    resetMock.mockResolvedValue({ error: null })

    const formData = new FormData()
    formData.set('email', 'test@test.com')

    await sendPasswordResetEmail(formData)

    expect(resetMock).toHaveBeenCalled()
  })
})

describe('updatePassword', () => {
  const updateMock = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { updateUser: updateMock },
    })
  })

  it('updates password and redirects', async () => {
    updateMock.mockResolvedValue({ error: null })

    const formData = new FormData()
    formData.set('password', 'new-pass')

    await updatePassword(formData)

    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })
})

describe('subscribeUser', () => {
  const getUserMock = jest.fn()
  const upsertMock = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: getUserMock },
      from: () => ({ upsert: upsertMock }),
    })
  })

  it('upserts push subscription for authenticated user', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    upsertMock.mockResolvedValue({ error: null })

    const result = await subscribeUser({} as any)

    expect(result.success).toBe(true)
  })
})

describe('unsubscribeUser', () => {
  const getUserMock = jest.fn()
  const deleteMock = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: getUserMock },
      from: () => ({ delete: () => ({ eq: deleteMock }) }),
    })
  })

  it('deletes push subscription', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    deleteMock.mockResolvedValue({ error: null })

    const result = await unsubscribeUser()

    expect(result.success).toBe(true)
  })
})

describe('updateProfile', () => {
  const getUserMock = jest.fn()
  const updateMock = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: getUserMock },
      from: () => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: updateMock,
            }),
          }),
        }),
      }),
    })
  })

  it('updates profile for authenticated user', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    updateMock.mockResolvedValue({ data: { username: 'x' }, error: null })

    const result = await updateProfile({ username: 'x' })

    expect(result.success).toBe(true)
  })
})

describe('deleteUser', () => {
  const deleteUserMock = jest.fn()
  const removeMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createAdminClient as jest.Mock).mockReturnValue({
      auth: {
        admin: {
          deleteUser: deleteUserMock,
        },
      },
      storage: {
        from: () => ({
          remove: removeMock,
        }),
      },
    })
  })

  it('deletes auth user and avatar, then redirects', async () => {
    deleteUserMock.mockResolvedValue({ error: null })
    removeMock.mockResolvedValue({ error: null })

    await deleteUser('user-123')

    expect(createAdminClient).toHaveBeenCalled()
    expect(deleteUserMock).toHaveBeenCalledWith('user-123')
    expect(removeMock).toHaveBeenCalledWith(['user-123/avatar'])
    expect(redirect).toHaveBeenCalledWith('/signup')
  })

  it('throws when auth deletion fails', async () => {
    deleteUserMock.mockResolvedValue({
      error: { message: 'not allowed' },
    })

    await expect(deleteUser('user-123')).rejects.toThrow(
      'Failed to delete account',
    )

    expect(removeMock).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe('getSubscriptions', () => {
  const getUserMock = jest.fn()
  const selectMock = jest.fn()

  beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: getUserMock },
      from: () => ({
        select: () => ({
          eq: selectMock,
        }),
      }),
    })
  })

  it('returns subscriptions for authenticated user', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    selectMock.mockResolvedValue({ data: [], error: null })

    const result = await getSubscriptions()

    expect(result).toEqual([])
  })
})

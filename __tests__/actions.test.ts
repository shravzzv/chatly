import { deleteUser } from '@/app/actions'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

jest.mock('@/utils/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}))

jest.mock('next/navigation')

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
      'Failed to delete account'
    )

    expect(removeMock).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })
})

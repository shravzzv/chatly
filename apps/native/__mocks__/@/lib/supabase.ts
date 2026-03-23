// apps/native/__mocks__/@/lib/supabase.ts
import { type SupabaseClient } from '@supabase/supabase-js'

export const signUpMock = jest.fn()
export const signInWithPasswordMock = jest.fn()
export const resetPasswordForEmailMock = jest.fn()
export const getSessionMock = jest.fn()
export const updateUserMock = jest.fn()

export const supabase = {
  auth: {
    signUp: signUpMock,
    signInWithPassword: signInWithPasswordMock,
    resetPasswordForEmail: resetPasswordForEmailMock,
    getSession: getSessionMock,
    updateUser: updateUserMock,
  },
} as unknown as SupabaseClient

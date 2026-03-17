// apps/native/__mocks__/@/lib/supabase.ts

import { type SupabaseClient } from '@supabase/supabase-js'

export const signUpMock = jest.fn()
export const signInWithPasswordMock = jest.fn()

export const supabase = {
  auth: {
    signUp: signUpMock,
    signInWithPassword: signInWithPasswordMock,
  },
} as unknown as SupabaseClient

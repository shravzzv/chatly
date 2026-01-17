'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { PushSubscription } from 'web-push'
import { Profile } from '@/types/profile'
import { createAdminClient } from '@/utils/supabase/admin'

type OAuthProvider = 'google' | 'github' | 'apple'

const getSiteURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'

  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`

  return url
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const plan = formData.get('plan') as string
  const billing = formData.get('billing') as string

  const emailRedirectTo = `${getSiteURL()}dashboard${
    plan && billing ? `?plan=${plan}&billing=${billing}` : ''
  }`

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  })

  if (error) {
    console.error(error)
    redirect('/error')
  }
}

export async function signin(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signInWithProvider(
  provider: OAuthProvider,
  plan?: string,
  billing?: string,
) {
  const supabase = await createClient()
  const redirectTo = new URL('auth/callback', getSiteURL())
  redirectTo.searchParams.set('next', '/dashboard')

  if (plan && billing) {
    redirectTo.searchParams.set('plan', plan)
    redirectTo.searchParams.set('billing', billing)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectTo.toString() },
  })

  if (error) {
    console.error(error)
    return redirect('/error')
  }

  redirect(data.url)
}

export async function sendPasswordResetEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const redirectTo = `${getSiteURL()}update-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { error: error.message }
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function subscribeUser(sub: PushSubscription) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      subscription: sub,
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('subscribeUser error:', error)
    return { success: false, error: error }
  }
}

export async function unsubscribeUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('unsubscribeUser error:', error)
    return { success: false, error: error }
  }
}

export async function updateProfile(updates: Partial<Profile>) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) throw error

    return { success: true, updatedProfile }
  } catch (error) {
    console.error('update profile error:', error)

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {
      return {
        success: false,
        field: 'username',
        message: 'This username is already taken',
      }
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'An Unknown server error occured',
    }
  }
}

export async function deleteUser(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    console.error('Failed to delete auth user', error)
    throw new Error('Failed to delete account')
  }

  const { error: avatarDeleteError } = await supabase.storage
    .from('avatars')
    .remove([`${id}/avatar`])

  if (avatarDeleteError) {
    console.warn('Failed to delete avatar', avatarDeleteError)
  }

  redirect('/signup')
}

export async function getSubscriptions() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)

  if (error) throw error
  return data
}

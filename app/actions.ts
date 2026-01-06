'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { PushSubscription } from 'web-push'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const plan = formData.get('plan') as string
  const billing = formData.get('billing') as string

  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL_ROOT}/dashboard${
    plan && billing ? `?plan=${plan}&billing=${billing}` : ''
  }`

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })

  if (error) return redirect('/error')
}

export async function signin(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signInWithGoogle(plan?: string, billing?: string) {
  const supabase = await createClient()

  const redirectUrl = `${
    process.env.NEXT_PUBLIC_APP_URL_ROOT
  }/auth/callback?next=/dashboard${
    plan && billing ? `&plan=${plan}&billing=${billing}` : ''
  }`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl },
  })

  if (error) redirect('/error')
  redirect(data.url)
}

export async function signInWithGithub(plan?: string, billing?: string) {
  const supabase = await createClient()

  const redirectUrl = `${
    process.env.NEXT_PUBLIC_APP_URL_ROOT
  }/auth/callback?next=/dashboard${
    plan && billing ? `&plan=${plan}&billing=${billing}` : ''
  }`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: redirectUrl },
  })

  if (error) redirect('/error')
  redirect(data.url)
}

export async function signInWithApple(plan?: string, billing?: string) {
  const supabase = await createClient()

  const redirectUrl = `${
    process.env.NEXT_PUBLIC_APP_URL_ROOT
  }/auth/callback?next=/dashboard${
    plan && billing ? `&plan=${plan}&billing=${billing}` : ''
  }`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: redirectUrl },
  })

  if (error) redirect('/error')
  redirect(data.url)
}

export async function signout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut({ scope: 'local' })

  if (error) {
    console.error('Sign out failed on server:', error)
  }

  redirect('/signin')
}

export async function sendPasswordResetEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL_ROOT}/update-password`,
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

export async function updateProfile(data: {
  name: string
  username: string
  bio?: string
}) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', user.id)
      .select('name, username, bio')
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

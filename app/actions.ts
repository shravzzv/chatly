'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { PushSubscription } from 'web-push'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL_ROOT}/dashboard`,
    },
  })

  if (error) {
    return redirect('/error')
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
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL_ROOT}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    redirect('/error')
  }

  redirect(data.url)
}

export async function signInWithGithub() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL_ROOT}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    redirect('/error')
  }

  redirect(data.url)
}

export async function signInWithApple() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL_ROOT}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    redirect('/error')
  }

  if (data.url) {
    redirect(data.url)
  }
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

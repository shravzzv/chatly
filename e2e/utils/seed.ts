import { randomUUID } from 'crypto'
import { supabaseAdmin } from './supabase'

export type SeededUser = {
  id: string
  email: string
  password: string
  username: string
}

export async function seedUser(label: string): Promise<SeededUser> {
  const email = `${label}-${randomUUID()}@e2e.chatly.test`
  const password = 'password123'
  const username = `${label}_${randomUUID().slice(0, 8)}`

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) throw error

  // Profile is created automatically by your system
  await supabaseAdmin
    .from('profiles')
    .update({
      username,
    })
    .eq('user_id', data.user.id)

  return {
    id: data.user.id,
    email,
    password,
    username,
  }
}

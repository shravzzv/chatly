import { randomUUID } from 'crypto'
import { supabaseAdmin } from './supabase'

/**
 * Represents a fully-initialized test user created for E2E scenarios.
 *
 * These users are real Supabase Auth users with confirmed emails
 * and valid profile records, allowing them to pass through all
 * authentication, authorization, and RLS checks.
 */
export type SeededUser = {
  id: string
  email: string
  password: string
  username: string
}

/**
 * Creates a fully usable test user for end-to-end tests.
 *
 * This helper:
 * - Creates a Supabase Auth user with email confirmation enabled
 * - Ensures the corresponding profile record is updated with a username
 * - Returns credentials that can be used immediately for UI login
 *
 * Each invocation generates unique identifiers to avoid collisions
 * across parallel test runs or repeated executions.
 *
 * If any step fails, the error is thrown to fail fast and prevent
 * partially-seeded test state.
 */
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

  // Profile is created automatically by a supabase trigger
  // only the username needs to be updated for realistic UI behavior
  const { error: profileUpdateError } = await supabaseAdmin
    .from('profiles')
    .update({
      username,
    })
    .eq('user_id', data.user.id)

  if (profileUpdateError) throw profileUpdateError

  return {
    id: data.user.id,
    email,
    password,
    username,
  }
}

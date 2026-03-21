// apps/native/lib/errors.ts
import { type AuthError } from '@supabase/supabase-js'

/**
 * Maps a Supabase AuthError from the signup flow into a UI-friendly structure.
 *
 * This function translates low-level, inconsistent backend error messages into
 * stable, user-facing errors that can be safely rendered in the UI.
 *
 * - Returns a `field` when the error is tied to a specific form input (e.g. email already in use),
 *   allowing it to be displayed via react-hook-form using `setError`.
 * - Returns only a `message` for global/system errors (e.g. rate limiting, network issues),
 *   which should be shown in a form-level alert.
 *
 * The mapping intentionally avoids exposing raw server messages to ensure
 * consistent wording, better UX, and resilience to backend message changes.
 *
 * @param error - The AuthError returned from Supabase `auth.signUp`
 * @returns An object containing a user-friendly message and optionally a target form field
 */
export const mapSignupAuthErrors = (
  error: AuthError,
): {
  field?: 'email'
  message: string
} => {
  const msg = error.message?.toLowerCase() ?? ''

  if (msg.includes('already') && msg.includes('registered')) {
    return {
      field: 'email',
      message: 'Email already in use',
    }
  }

  if (msg.includes('rate') && msg.includes('limit')) {
    return {
      message: 'Too many attempts. Please try again later.',
    }
  }

  if (msg.includes('network') || msg.includes('fetch')) {
    return {
      message: 'Network error. Please check your connection.',
    }
  }

  return {
    message: 'Something went wrong. Please try again.',
  }
}

/**
 * Maps auth errors from db into succinct user facing semantic messages.
 *
 * @param error - The AuthError returned from Supabase `auth.signInWithPassword`
 * @returns A string containing the mapped error message.
 */
export const mapSigninAuthErrors = (error: AuthError) => {
  const msg = error.message.toLowerCase() ?? ''

  if (msg.includes('invalid') && msg.includes('credentials')) {
    return 'Check your email and password and try again.'
  }

  if (msg.includes('rate') && msg.includes('limit')) {
    return 'Too many attempts. Please try again later.'
  }

  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Please check your connection.'
  }

  return 'Something went wrong. Please try again.'
}

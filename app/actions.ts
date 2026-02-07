'use server'

import type { PushSubscription } from 'web-push'
import type { Profile } from '@/types/profile'
import type { UsageKind } from '@/types/plan'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getSiteURL } from '@/lib/url'
import { generateText } from 'ai'

/**
 * OAuth providers supported by the application.
 *
 * Used to constrain sign-in flows to explicitly enabled
 * identity providers supported by Supabase.
 */
type OAuthProvider = 'google' | 'github' | 'apple'

/**
 * Optional parameters passed through the OAuth flow.
 *
 * These values are preserved across redirects so the
 * application can continue a pricing or upgrade flow
 * after authentication completes.
 */
interface SignInWithProviderOptions {
  plan: string
  billing: string
}

/**
 * Creates a new user account using email + password.
 *
 * After signup, Supabase sends a confirmation email.
 * The confirmation link redirects the user back to the app,
 * landing on `/dashboard` once the email is verified.
 *
 * If a plan and billing cycle are present (pricing page signup),
 * they are preserved in the redirect URL so the dashboard
 * can continue the upgrade flow post-verification.
 *
 * This function does NOT create a session immediately —
 * the user must confirm their email first.
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const plan = formData.get('plan') as string
  const billing = formData.get('billing') as string

  const emailRedirectTo = new URL('dashboard', getSiteURL())
  if (plan && billing) {
    emailRedirectTo.searchParams.set('plan', plan)
    emailRedirectTo.searchParams.set('billing', billing)
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: emailRedirectTo.toString() },
  })

  if (error) {
    console.error(error)
    redirect('/error')
  }
}

/**
 * Signs in a user using email + password credentials.
 *
 * On success, Supabase sets the session cookie and the user
 * is redirected directly to the dashboard.
 *
 * Authentication failures (invalid credentials, etc.)
 * are returned as user-facing errors instead of redirecting,
 * allowing the UI to display inline feedback.
 */
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

/**
 * Initiates OAuth sign-in with a third-party provider
 * (Google, GitHub, Apple).
 *
 * The user is redirected to the provider, and upon success,
 * the provider sends them back to `/auth/callback`.
 *
 * The callback route is responsible for exchanging the OAuth
 * code for a Supabase session and finalizing login.
 *
 * Optional plan and billing parameters are forwarded through
 * the OAuth round-trip so pricing intent is preserved.
 */
export async function signInWithProvider(
  provider: OAuthProvider,
  options?: SignInWithProviderOptions,
) {
  const supabase = await createClient()

  const redirectTo = new URL('auth/callback', getSiteURL())
  redirectTo.searchParams.set('next', '/dashboard')
  if (options) {
    redirectTo.searchParams.set('plan', options.plan)
    redirectTo.searchParams.set('billing', options.billing)
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

/**
 * Sends a password reset email to the user.
 *
 * The email contains a secure link that redirects the user
 * back to the app’s `/update-password` page.
 *
 * The actual password change happens only after the user
 * follows the link and submits a new password.
 *
 * Errors are returned to the caller to allow inline UI handling.
 */
export async function sendPasswordResetEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const redirectTo = new URL('update-password', getSiteURL())

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo.toString(),
  })

  if (error) {
    return { error: error.message }
  }
}

/**
 * Updates the authenticated user’s password.
 *
 * This action is typically reached via a password reset
 * or recovery flow, where Supabase has already verified
 * the user via a secure token.
 *
 * On success, the user is redirected to the dashboard.
 */
export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  redirect('/dashboard')
}

/**
 * Registers a Web Push subscription for the authenticated user.
 *
 * Each user has at most one active push subscription record.
 * Repeated subscriptions overwrite the previous entry.
 *
 * This function enforces authentication at runtime and
 * gracefully reports failures for observability.
 */
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

/**
 * Removes the authenticated user’s Web Push subscription.
 *
 * This effectively disables push notifications for the user.
 *
 * The operation is idempotent — calling it when no subscription
 * exists is treated as a successful no-op.
 */
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

/**
 * Updates mutable fields on the user’s profile record.
 *
 * The authenticated user is resolved server-side to prevent
 * unauthorized updates.
 *
 * Handles known constraint errors (e.g. duplicate usernames)
 * and converts them into structured, user-friendly responses.
 *
 * All other errors are logged and surfaced as generic failures.
 */
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

/**
 * Permanently deletes a user account.
 *
 * This operation uses the Supabase Admin API and therefore
 * bypasses normal RLS protections.
 *
 * Side effects:
 * - Deletes the user from Supabase Auth
 * - Attempts to clean up associated avatar storage
 *
 * Subscription records are intentionally NOT cleaned up here;
 * webhook sync may still attempt updates, which are safely ignored.
 *
 * On success, the user is redirected to the signup page.
 */
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

/**
 * Fetches all subscription records for the authenticated user.
 * A user can have multiple subscriptions. Expiry is the end of a subscription's lifecycle.
 * Renewal requires a new subscription.
 *
 * This function performs no business logic — it simply returns
 * raw subscription rows.
 *
 * Higher-level helpers (e.g. `getEffectiveSubscription`) are
 * responsible for interpreting access, plan state, and status.
 *
 * Throws if called without an authenticated user.
 */
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

/**
 * Enhances a chat message using AI while enforcing usage limits.
 *
 * This is a **paid feature boundary**:
 * - AI usage is incremented before generation
 * - Limits are enforced server-side
 * - Errors are thrown and must be handled by the caller
 *
 * The enhancement is conservative:
 * - Preserves meaning, intent, and tone
 * - Makes minimal changes
 * - May return the original text if no improvement is needed
 *
 * @param text - Original message text
 * @returns Enhanced (or unchanged) message text
 *
 * @throws Error if:
 * - User is on a free plan (`USER_ON_FREE_PLAN`)
 * - Daily AI limit is exceeded (`USAGE_LIMIT_EXCEEDED`)
 * - AI service fails (`AI_SERVICE_ERROR`)
 */
export async function enhanceText(text: string): Promise<string> {
  if (!text || !text.trim()) return text

  const systemPrompt = `
    You improve chat messages.

    Rules:
    - Preserve the original meaning, intent, and tone.
    - Do NOT add new information, emotion, or politeness.
    - Keep the message natural for casual chat.
    - Make minimal changes unless the message is clearly unclear.
    - Do not over-formalize.
    - If the message is already good, return it unchanged.
    - Return ONLY the improved message, with no quotes or explanations.
  `.trim()

  /**
   * AI usage is incremented **before** making the request.
   *
   * Unlike media uploads, AI calls incur cost even if they fail.
   * By checking and incrementing upfront, it is ensured that:
   * - Every attempted AI call is counted
   * - Failed generations do not bypass usage limits
   *
   * This keeps billing and usage enforcement accurate.
   */
  await checkAndIncrementUsage('ai')

  try {
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      prompt: text,
    })

    return result.text.trim()
  } catch (error) {
    console.error('generateText failed', error)
    throw Error('AI_SERVICE_ERROR', { cause: error })
  }
}

/**
 * Checks whether the authenticated user is allowed to use a paid feature
 * within the current usage window, and atomically increments usage if allowed.
 *
 * This function is **server-side authoritative** and represents the single
 * source of truth for billing and rate limiting.
 *
 * **RESPONSIBILITIES**
 * - Resolves the user's effective subscription plan
 * - Enforces daily usage limits via a Postgres RPC
 * - Atomically increments usage only if the limit has not been exceeded
 *
 * **CALLING SEMANTICS**
 * This function MUST be called only after the system has determined that
 * the feature action is valid and about to be committed:
 *
 * - **AI enhancements**: call immediately before applying the enhancement
 * - **Media uploads**: call only after the file has been successfully stored
 *
 * This ensures that:
 * - Failed actions are never charged
 * - Usage is only counted for irreversible work
 *
 * **CLIENT SYNC**
 *
 * Clients MUST NOT optimistically assume success.
 * Any UI usage updates (e.g. via `reflectUsageIncrement`) must happen
 * **only after this function resolves successfully**.
 *
 * @param usageKind - The type of paid feature being used (`media` or `ai`)
 *
 * @returns The updated usage state for the current window as returned
 *          by the database RPC (shape is intentionally opaque to callers).
 *
 * @throws Error if:
 * - The user is not on a paid plan (`USER_ON_FREE_PLAN`)
 * - The daily usage limit has been exceeded (`USAGE_LIMIT_EXCEEDED`)
 * - The RPC fails or the user is not authenticated
 */
export async function checkAndIncrementUsage(usageKind: UsageKind) {
  const supabase = await createClient()

  // delegate atomic enforcement + increment to the database
  const { data, error } = await supabase.rpc('check_and_increment_usage', {
    usage_kind: usageKind,
  })

  if (error) {
    if (typeof error === 'object' && 'message' in error) {
      const msg = String(error.message)

      if (msg === 'USER_ON_FREE_PLAN') {
        throw Error(msg)
      }

      if (msg === 'USAGE_LIMIT_EXCEEDED') {
        throw Error(msg)
      }
    }

    throw error
  }

  return data
}

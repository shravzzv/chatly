import { createUserClient } from './supabase-client.ts'

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
 * - **AI enhancements**: call immediately before applying the enhancement
 * - **Media uploads**: call only after the file has been successfully stored
 *
 * This ensures that usage is only counted for irreversible work
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
export async function checkAndIncUsage(
  req: Request,
  usageKind: 'media' | 'ai',
) {
  const supabase = createUserClient(req)

  // delegate atomic enforcement + increment to the database
  const { data, error } = await supabase.rpc('check_and_increment_usage', {
    usage_kind: usageKind,
  })

  if (error) {
    if (typeof error === 'object' && 'message' in error) {
      const msg = String(error.message)
      const knownErrors = [
        'USER_ON_FREE_PLAN',
        'USAGE_LIMIT_EXCEEDED',
        'INVALID_USAGE_KIND',
        'FEATURE_NOT_AVAILABLE',
      ]

      if (knownErrors.includes(msg)) throw Error(msg)
    }

    throw error
  }

  return data
}

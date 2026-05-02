import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/providers/auth-provider'
import { getCurrentPlan, PLAN_LIMITS } from '@chatly/lib/billing'
import type { ChatlyPlan, UsageKind } from '@chatly/types/plan'
import { Subscription } from '@chatly/types/subscription'
import { type PostgrestError } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

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
export async function getSubscriptions(): Promise<Subscription[]> {
  if (!supabase) throw Error('Supabase client not present')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw Error('Not authenticated')

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)

  if (error) throw error
  return data
}

/**
 * Result shape returned by `useUsage`.
 *
 * This interface represents an **advisory snapshot** of the user's
 * current plan and usage state, intended exclusively for client-side UI.
 *
 * All values are derived from:
 * - The user's active subscription plan.
 * - Today's usage window (UTC).
 *
 * None of these fields should be relied on for security or billing.
 */
export interface UseUsageResult {
  /** The user's currently effective plan (derived from subscriptions). */
  readonly plan: ChatlyPlan

  /** Whether usage/plan data is still being resolved. */
  readonly loading: boolean

  /** Any error encountered while fetching usage data. */
  readonly error: PostgrestError | null

  /** Number of AI enhancements used today. */
  readonly aiUsed: number

  /** Whether the user may initiate another AI enhancement (UI-level). */
  readonly canUseAi: boolean

  /** Remaining AI enhancements for today (never negative). */
  readonly aiRemaining: number

  /** Number of media attachments used today. */
  readonly mediaUsed: number

  /** Whether the user may upload another media attachment (UI-level). */
  readonly canUseMedia: boolean

  /** Remaining media uploads for today (never negative). */
  readonly mediaRemaining: number

  /**
   * Mirrors a successful usage increment locally.
   *
   * This function exists purely to keep the UI in sync after
   * a server-validated action succeeds.
   *
   * - It does NOT persist data
   * - It does NOT bypass server enforcement
   * - It MUST NOT be called optimistically
   *
   * Think of this as a *local echo*, not a mutation.
   */
  readonly reflectUsageIncrement: (kind: UsageKind) => void
}

/**
 * `useUsage`
 *
 * Advisory, **read-only** usage hook for client-side UX decisions.
 *
 * This hook mirrors the user's **current-day usage window** (`usage_windows`)
 * and active subscription plan in order to:
 *
 * - Gate UI affordances (disable buttons, block actions)
 * - Display remaining quota and progress meters
 * - Trigger upgrade prompts at the correct boundary
 *
 * ⚠️ IMPORTANT SEMANTICS
 * - This hook is **NOT authoritative**.
 * - All enforcement, billing, and rate limiting MUST happen on the server.
 * - Client-side checks are strictly for responsiveness and UX.
 *
 * The server remains the single source of truth.
 *
 * DATA SOURCES
 * - Usage: fetched once on mount from `usage_windows` for *today (UTC)*
 * - Plan: derived from subscriptions via `getSubscriptions()`
 *
 * SYNC MODEL
 * This hook does NOT subscribe to realtime updates.
 * Instead, it:
 * - Initializes from the database on mount
 * - Optionally mirrors *successful* usage via `reflectUsageIncrement`
 *
 * This avoids:
 * - Realtime fanout on hot paths
 * - Accidental coupling of billing logic to client state
 *
 * @returns An immutable snapshot of usage state + a local mirror helper
 */
export const useUsage = (): Readonly<UseUsageResult> => {
  interface Usage {
    user_id: string
    window_date: string
    media_used: number
    ai_used: number
  }

  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [plan, setPlan] = useState<ChatlyPlan>('free')
  const { userId: currentUserId } = useAuthContext()

  const aiUsed = usage?.ai_used ?? 0
  const mediaUsed = usage?.media_used ?? 0
  const canUseAi = aiUsed < PLAN_LIMITS[plan].ai
  const canUseMedia = mediaUsed < PLAN_LIMITS[plan].media
  const aiRemaining = Math.max(0, PLAN_LIMITS[plan].ai - aiUsed)
  const mediaRemaining = Math.max(0, PLAN_LIMITS[plan].media - mediaUsed)

  /**
   * Mirrors a successful usage increment locally.
   *
   * This is a **UI-only helper** used after the server has already
   * accepted and recorded a usage event (e.g. AI enhancement succeeded,
   * media upload completed).
   *
   * It exists to:
   * - Keep the UI responsive without refetching
   * - Ensure immediate consistency for limits and progress bars
   *
   * ⚠️ This function:
   * - Does NOT write to the database
   * - Does NOT perform validation
   * - Must ONLY be called after server success
   *
   * Calling this optimistically without server confirmation
   * would desynchronize the UI from reality.
   */
  const reflectUsageIncrement = (kind: UsageKind) => {
    setUsage((prev) => {
      if (!prev) return prev
      const key = kind === 'ai' ? 'ai_used' : 'media_used'

      return {
        ...prev,
        [key]: prev[key] + 1,
      }
    })
  }

  /**
   * Fetch usage on mount.
   */
  useEffect(() => {
    if (!currentUserId) {
      setUsage(null)
      setLoading(false)
      return
    }

    const fetchUsage = async () => {
      if (!supabase) return
      setLoading(true)

      try {
        const today = new Date().toISOString().slice(0, 10)

        const { data, error } = await supabase
          .from('usage_windows')
          .select()
          .eq('user_id', currentUserId)
          .eq('window_date', today)
          .maybeSingle()

        if (error) throw error

        setUsage(data)
        setError(null)
      } catch (error) {
        setError(error as PostgrestError)
        console.error('Error fetching usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [currentUserId])

  /**
   * Fetch plan on mount.
   */
  useEffect(() => {
    if (!currentUserId) return

    const fetchPlan = async () => {
      try {
        const subs = await getSubscriptions()
        const plan = getCurrentPlan(subs)
        setPlan(plan)
      } catch (error) {
        console.warn('Failed to fetch plan, defaulting to free', error)
      }
    }

    fetchPlan()
  }, [currentUserId])

  return {
    loading,
    error,
    plan,
    aiUsed,
    mediaUsed,
    canUseAi,
    canUseMedia,
    aiRemaining,
    mediaRemaining,
    reflectUsageIncrement,
  }
}

import { type PostgrestError } from '@supabase/supabase-js'
import type { UsageKind, ChatlyPlan } from './plan'

/**
 * Result shape returned by `useUsage`.
 *
 * This interface represents an **advisory snapshot** of the user's
 * current plan and usage state, intended exclusively for client-side UI.
 *
 * All values are derived from:
 * - The user's active subscription plan
 * - Today's usage window (UTC)
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

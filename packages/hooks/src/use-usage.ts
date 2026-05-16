import { getCurrentPlan, PLAN_LIMITS } from '@chatly/lib/billing'
import type { ChatlyPlan } from '@chatly/types/plan'
import type { Subscription } from '@chatly/types/subscription'
import { type PostgrestError, type SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import type { UseUsageResult } from '../types/use-usage'

interface Usage {
  user_id: string
  window_date: string
  media_used: number
  ai_used: number
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
 *
 * This avoids:
 * - Realtime fanout on hot paths
 * - Accidental coupling of billing logic to client state
 *
 * @returns An immutable snapshot of usage state + a local mirror helper
 */
export const useUsage = (
  supabase: SupabaseClient,
  currentUserId: string | null,
): Readonly<UseUsageResult> => {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [plan, setPlan] = useState<ChatlyPlan>('free')

  const aiUsed = usage?.ai_used ?? 0
  const mediaUsed = usage?.media_used ?? 0
  const canUseAi = aiUsed < PLAN_LIMITS[plan].ai
  const canUseMedia = mediaUsed < PLAN_LIMITS[plan].media
  const aiRemaining = Math.max(0, PLAN_LIMITS[plan].ai - aiUsed)
  const mediaRemaining = Math.max(0, PLAN_LIMITS[plan].media - mediaUsed)

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
  }, [currentUserId, supabase])

  /**
   * Fetch plan on mount.
   */
  useEffect(() => {
    if (!currentUserId) return

    const getSubscriptions = async (): Promise<Subscription[]> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', currentUserId)

      if (error) throw error
      return data
    }

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
  }, [currentUserId, supabase])

  /**
   * Handle realtime for cross device sync.
   */
  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase
      .channel('usage:realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_windows',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const data = payload.new as Usage
          const today = new Date().toISOString().slice(0, 10)
          if (data.window_date === today) setUsage(data)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, currentUserId])

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
  }
}

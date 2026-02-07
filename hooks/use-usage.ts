'use client'

import { useEffect, useState } from 'react'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { createClient } from '@/utils/supabase/client'
import { getSubscriptions } from '@/app/actions'
import { getCurrentPlan } from '@/lib/billing'
import { PLAN_LIMITS } from '@/data/plans'
import { type PostgrestError } from '@supabase/supabase-js'
import type { ChatlyPlan, UsageKind } from '@/types/plan'
import type { UseUsageResult } from '@/types/use-usage'

/**
 * `useUsage`
 *
 * Read-only hook that exposes current plan usage
 * for driving client-side UI (limits, disable states, upgrade prompts).
 *
 * This hook is advisory only — the server remains authoritative.
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
  const currentUserId = useChatlyStore((state) => state.user)?.id

  const aiUsed = usage?.ai_used ?? 0
  const mediaUsed = usage?.media_used ?? 0
  const canUseAi = aiUsed < PLAN_LIMITS[plan].ai
  const canUseMedia = mediaUsed < PLAN_LIMITS[plan].media
  const aiRemaining = Math.max(0, PLAN_LIMITS[plan].ai - aiUsed)
  const mediaRemaining = Math.max(0, PLAN_LIMITS[plan].media - mediaUsed)

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
      setLoading(true)

      try {
        const supabase = createClient()
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

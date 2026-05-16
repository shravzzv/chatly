'use client'

import { createClient } from '@/utils/supabase/client'
import { useUsage } from '@chatly/hooks/use-usage'
import type { ChatlyPlan } from '@chatly/types/plan'
import {
  createContext,
  useContext,
  useEffect,
  type PropsWithChildren,
} from 'react'
import { useChatlyStore } from './chatly-store-provider'

interface PrivateContextValue {
  // usage
  readonly plan: ChatlyPlan
  readonly usageLoading: boolean
  readonly aiUsed: number
  readonly canUseAi: boolean
  readonly aiRemaining: number
  readonly mediaUsed: number
  readonly canUseMedia: boolean
  readonly mediaRemaining: number
}

const PrivateContext = createContext<PrivateContextValue | null>(null)

/**
 * `PrivateProvider`
 *
 * Feature-scoped orchestration layer for the private pages.
 *
 * All private pages are expected to consume state via `usePrivateContext`.
 */
export function PrivateProvider({ children }: PropsWithChildren) {
  const supabase = createClient()
  const currentUserId = useChatlyStore((state) => state.user)?.id ?? null

  const {
    loading: usageLoading,
    error: usageError,
    plan,
    aiRemaining,
    aiUsed,
    canUseAi,
    canUseMedia,
    mediaRemaining,
    mediaUsed,
  } = useUsage(supabase, currentUserId)

  useEffect(() => {
    if (usageError) console.warn('Failed to load usage')
  }, [usageError])

  const value: PrivateContextValue = {
    usageLoading,
    plan,
    aiRemaining,
    aiUsed,
    canUseAi,
    canUseMedia,
    mediaRemaining,
    mediaUsed,
  }

  return (
    <PrivateContext.Provider value={value}>{children}</PrivateContext.Provider>
  )
}

/**
 * `usePrivateContext`
 *
 * Read-only accessor for dashboard-scoped state and actions.
 *
 * Must be used within `PrivateProvider`.
 * Throws eagerly if accessed outside the provider to prevent
 * silent misuse and partial state reads.
 */
export function usePrivateContext() {
  const ctx = useContext(PrivateContext)
  if (!ctx) throw Error('usePrivateContext must be used within PrivateProvider')
  return ctx
}

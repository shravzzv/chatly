'use client'

import { createClient } from '@/utils/supabase/client'
import { useProfiles } from '@chatly/hooks/use-profiles'
import { useUsage } from '@chatly/hooks/use-usage'
import type { ChatlyPlan } from '@chatly/types/plan'
import type { Profile } from '@chatly/types/profile'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { toast } from 'sonner'
import { useChatlyStore } from './chatly-store-provider'

interface PrivateContextValue {
  // profiles
  readonly profiles: Profile[]
  readonly filteredProfiles: Profile[]
  readonly profilesLoading: boolean
  readonly profile: Profile | null

  // search
  readonly searchQuery: string
  setSearchQuery: (q: string) => void

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

  const [searchQuery, setSearchQuery] = useState('')

  const {
    profiles,
    filteredProfiles,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles(searchQuery, supabase)

  const profile = useMemo(
    () => profiles.find((p) => p.user_id === currentUserId) ?? null,
    [currentUserId, profiles],
  )

  useEffect(() => {
    if (profilesError) toast.error('Failed to load profiles')
  }, [profilesError])

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
    // profiles
    profiles,
    filteredProfiles,
    profilesLoading,
    profile,

    // search
    searchQuery,
    setSearchQuery,

    // usage
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

'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { useProfiles } from '@/hooks/use-profiles'
import { useMessages } from '@/hooks/use-messages'
import { usePreviews } from '@/hooks/use-previews'
import { toast } from 'sonner'
import type { DashboardContextValue } from '@/types/dashboard'
import { useSearchParams } from 'next/navigation'
import { useUsage } from '@/hooks/use-usage'
import { UsageKind } from '@/types/plan'

const DashboardContext = createContext<DashboardContextValue | null>(null)

/**
 * `DashboardProvider`
 *
 * Feature-scoped orchestration layer for the dashboard.
 *
 * Responsibilities:
 * - Owns dashboard UI state (selection, search, dialogs)
 * - Composes data hooks (profiles, previews, messages)
 * - Wires cross-hook side effects (preview updates, deletes)
 * - Surfaces a stable, read-optimized API to dashboard components
 *
 * Non-responsibilities:
 * - Does not perform routing or auth
 * - Does not contain presentation logic
 * - Does not expose raw Supabase or mutation APIs
 *
 * All dashboard components are expected to consume state via `useDashboard`.
 */
export function DashboardProvider({ children }: PropsWithChildren) {
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    () => searchParams.get('senderId'),
  )
  const [isProfileSelectDialogOpen, setIsProfileSelectDialogOpen] =
    useState(false)
  const [upgradeReason, setUpgradeReason] = useState<UsageKind | null>(null)

  const {
    profiles,
    filteredProfiles,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles(searchQuery)

  useEffect(() => {
    if (profilesError) toast.error('Failed to load profiles')
  }, [profilesError])

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.user_id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  )

  const {
    previews,
    loading: previewsLoading,
    error: previewsError,
    updatePreview,
    deletePreview,
  } = usePreviews()

  useEffect(() => {
    if (previewsError) toast.error('Failed to load previews')
  }, [previewsError])

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    deleteMessage,
    editMessage,
  } = useMessages({
    selectedProfileId,
    updatePreview,
    deletePreview,
  })

  useEffect(() => {
    if (messagesError) toast.error('Failed to load messages')
  }, [messagesError])

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
    reflectUsageIncrement,
  } = useUsage()

  useEffect(() => {
    if (usageError) console.warn('Failed to load usage')
  }, [usageError])

  const openProfileSelectDialog = () => setIsProfileSelectDialogOpen(true)
  const closeProfileSelectDialog = () => setIsProfileSelectDialogOpen(false)
  const closeChatPanel = () => setSelectedProfileId(null)

  const openUpgradeAlertDialog = (reason: UsageKind) => {
    setUpgradeReason(reason)
  }
  const closeUpgradeAlertDialog = () => setUpgradeReason(null)

  const value: DashboardContextValue = {
    profiles,
    filteredProfiles,
    profilesLoading,

    previews,
    previewsLoading,

    messages,
    messagesLoading,
    sendMessage,
    editMessage,
    deleteMessage,

    searchQuery,
    setSearchQuery,

    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,

    isProfileSelectDialogOpen,
    openProfileSelectDialog,
    closeProfileSelectDialog,
    closeChatPanel,

    usageLoading,
    plan,
    aiRemaining,
    aiUsed,
    canUseAi,
    canUseMedia,
    mediaRemaining,
    mediaUsed,
    reflectUsageIncrement,

    upgradeReason,
    openUpgradeAlertDialog,
    closeUpgradeAlertDialog,
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

/**
 * `useDashboardContext`
 *
 * Read-only accessor for dashboard-scoped state and actions.
 *
 * Must be used within `DashboardProvider`.
 * Throws eagerly if accessed outside the provider to prevent
 * silent misuse and partial state reads.
 */
export function useDashboardContext() {
  const context = useContext(DashboardContext)

  if (!context) {
    throw new Error('useDashboardContext must be used within DashboardProvider')
  }

  return context
}

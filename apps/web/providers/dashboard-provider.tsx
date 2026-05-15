'use client'

import { createClient } from '@/utils/supabase/client'
import { useMessages } from '@chatly/hooks/use-messages'
import { usePreviews } from '@chatly/hooks/use-previews'
import { useProfiles } from '@chatly/hooks/use-profiles'
import { useTyping } from '@chatly/hooks/use-typing'
import type { Message } from '@chatly/types/message'
import type { ChatlyPlan, UsageKind } from '@chatly/types/plan'
import type { Previews } from '@chatly/types/preview'
import type { Profile } from '@chatly/types/profile'
import { useSearchParams } from 'next/navigation'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useChatlyStore } from './chatly-store-provider'
import { usePrivateContext } from './private-provider'

interface DashboardContextValue {
  // profiles
  readonly profiles: Profile[]
  readonly filteredProfiles: Profile[]
  readonly profilesLoading: boolean

  // previews
  readonly previews: Previews
  readonly previewsLoading: boolean

  // messages
  readonly messages: Message[]
  readonly messagesLoading: boolean
  sendMessage: ReturnType<typeof useMessages>['sendMessage']
  editMessage: ReturnType<typeof useMessages>['editMessage']
  deleteMessage: ReturnType<typeof useMessages>['deleteMessage']

  // search
  readonly searchQuery: string
  setSearchQuery: (q: string) => void

  // selection & UI
  readonly selectedProfile: Profile | null
  readonly selectedProfileId: string | null
  setSelectedProfileId: (id: string | null) => void
  readonly isProfileSelectDialogOpen: boolean
  openProfileSelectDialog: () => void
  closeProfileSelectDialog: () => void
  closeChatPanel: () => void

  // typing
  readonly isTyping: boolean
  updateTypingStatus: (isTyping: boolean) => Promise<void>

  // usage
  readonly plan: ChatlyPlan
  readonly usageLoading: boolean
  readonly aiUsed: number
  readonly canUseAi: boolean
  readonly aiRemaining: number
  readonly mediaUsed: number
  readonly canUseMedia: boolean
  readonly mediaRemaining: number
  reflectUsageIncrement: (kind: UsageKind) => void

  // upgrade
  readonly upgradeReason: UsageKind | null
  openUpgradeAlertDialog: (reason: UsageKind) => void
  closeUpgradeAlertDialog: () => void
}

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
  const supabase = createClient()
  const searchParams = useSearchParams()
  const currentUserId = useChatlyStore((state) => state.user)?.id ?? null

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
  } = useProfiles(searchQuery, supabase)

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
  } = usePreviews(supabase, currentUserId)

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
    supabase,
    currentUserId,
    selectedProfileId,
    updatePreview,
    deletePreview,
    generateId: uuidv4,
  })

  useEffect(() => {
    if (messagesError) toast.error('Failed to load messages')
  }, [messagesError])

  const { isTyping, updateTypingStatus } = useTyping(
    supabase,
    currentUserId,
    selectedProfileId,
  )

  const {
    usageLoading,
    plan,
    aiRemaining,
    aiUsed,
    canUseAi,
    canUseMedia,
    mediaRemaining,
    mediaUsed,
    reflectUsageIncrement,
  } = usePrivateContext()
  /**
   * Provisionally providing private context values here.
   * Refactoring the consumers to use these values directly from
   * privateContext might be a good idea.
   */

  const openProfileSelectDialog = () => setIsProfileSelectDialogOpen(true)
  const closeProfileSelectDialog = () => setIsProfileSelectDialogOpen(false)
  const closeChatPanel = () => setSelectedProfileId(null)

  const openUpgradeAlertDialog = (reason: UsageKind) => {
    setUpgradeReason(reason)
  }
  const closeUpgradeAlertDialog = () => setUpgradeReason(null)

  const value: DashboardContextValue = {
    // profiles
    profiles,
    filteredProfiles,
    profilesLoading,

    // previews
    previews,
    previewsLoading,

    // messages
    messages,
    messagesLoading,
    sendMessage,
    editMessage,
    deleteMessage,

    // search
    searchQuery,
    setSearchQuery,

    // selection & UI
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    isProfileSelectDialogOpen,
    openProfileSelectDialog,
    closeProfileSelectDialog,
    closeChatPanel,

    // typing
    isTyping,
    updateTypingStatus,

    // usage
    usageLoading,
    plan,
    aiRemaining,
    aiUsed,
    canUseAi,
    canUseMedia,
    mediaRemaining,
    mediaUsed,
    reflectUsageIncrement,

    // upgrade
    upgradeReason,
    openUpgradeAlertDialog,
    closeUpgradeAlertDialog,
  }

  return <DashboardContext value={value}>{children}</DashboardContext>
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
  const ctx = useContext(DashboardContext)
  if (!ctx) {
    throw Error('useDashboardContext must be used within DashboardProvider')
  }
  return ctx
}

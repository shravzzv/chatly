import { useMessages } from '@/hooks/use-messages'
import { usePreviews } from '@/hooks/use-previews'
import { useProfiles } from '@/hooks/use-profiles'
import { useTyping } from '@/hooks/use-typing'
import type { Message } from '@chatly/types/message'
import type { Previews } from '@chatly/types/preview'
import type { Profile } from '@chatly/types/profile'
import { type PostgrestError } from '@supabase/supabase-js'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import { toast } from 'sonner-native'

interface PrivateContextValue {
  // profiles
  readonly profiles: Profile[]
  readonly filteredProfiles: Profile[]
  readonly profilesLoading: boolean
  readonly profilesError: PostgrestError | null

  // previews
  readonly previews: Previews
  readonly previewsLoading: boolean

  // messages
  readonly messages: Message[]
  readonly messagesLoading: boolean
  readonly messagesError: PostgrestError | null
  sendMessage: ReturnType<typeof useMessages>['sendMessage']
  editMessage: ReturnType<typeof useMessages>['editMessage']
  deleteMessage: ReturnType<typeof useMessages>['deleteMessage']

  // search
  readonly searchQuery: string
  setSearchQuery: (q: string) => void

  // selection & UI
  readonly selectedProfileId: string | null
  setSelectedProfileId: (id: string | null) => void

  // typing
  readonly isTyping: boolean
  updateTypingStatus: (isTyping: boolean) => Promise<void>
}

const PrivateContext = createContext<PrivateContextValue | null>(null)

/**
 * `PrivateProvider`
 *
 * Feature-scoped orchestration layer for all authenticated (private) screens.
 *
 * Responsibilities:
 * - Owns shared UI state for private routes (search query, selected profile)
 * - Composes domain hooks (profiles, previews, messages)
 * - Wires cross-hook dependencies (e.g. preview updates from messages)
 * - Surfaces a unified, read-optimized state for consuming screens
 * - Handles non-blocking side effects (e.g. toast notifications for errors)
 *
 * Non-responsibilities:
 * - Does not perform routing or navigation logic
 * - Does not render UI or presentation components
 * - Does not own Supabase client logic (delegated to hooks)
 * - Does not decide how errors are displayed (left to screens)
 *
 * Interaction model:
 * - Screens update `selectedProfileId` based on navigation (e.g. route params)
 * - Provider reacts to state changes and rehydrates dependent hooks
 * - Consumers read from a stable context instead of invoking hooks directly
 *
 * Error handling:
 * - Errors are exposed to consumers for rendering decisions
 * - Additionally emits toast notifications for immediate user feedback
 *
 * Usage:
 * - Must wrap all authenticated routes (e.g. `(private)` layout)
 * - All private screens should consume state via `usePrivateContext`
 *
 * @example
 * ```tsx
 * <PrivateProvider>
 *   <Stack />
 * </PrivateProvider>
 * ```
 */
export function PrivateProvider({ children }: PropsWithChildren) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  )

  const {
    profiles,
    filteredProfiles,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles(searchQuery)

  useEffect(() => {
    if (profilesError) toast.error('Failed to load profiles')
  }, [profilesError])

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

  const { isTyping, updateTypingStatus } = useTyping(selectedProfileId)

  const value: PrivateContextValue = {
    // profiles
    profiles,
    filteredProfiles,
    profilesLoading,
    profilesError,

    // previews
    previews,
    previewsLoading,

    // messages
    messages,
    messagesLoading,
    messagesError,
    sendMessage,
    editMessage,
    deleteMessage,

    // search
    searchQuery,
    setSearchQuery,

    // selection
    selectedProfileId,
    setSelectedProfileId,

    // typing
    isTyping,
    updateTypingStatus,
  }

  return <PrivateContext value={value}>{children}</PrivateContext>
}

/**
 * `usePrivateContext`
 *
 * Read-only accessor for private-scoped state and actions.
 *
 * Provides a unified interface over profiles, previews, messages,
 * and shared UI state managed by {@link PrivateProvider}.
 *
 * Must be used within {@link PrivateProvider}.
 * Throws eagerly if accessed outside the provider to prevent
 * silent misuse and partial state reads.
 *
 * @returns {PrivateContextValue} The current private app state and actions.
 */
export function usePrivateContext(): PrivateContextValue {
  const ctx = useContext(PrivateContext)
  if (!ctx) throw Error('usePrivateContext must be used within PrivateProvider')
  return ctx
}

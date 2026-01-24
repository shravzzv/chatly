'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { getPartnerId } from '@/lib/dashboard'
import { type Message } from '@/types/message'
import { type PostgrestError } from '@supabase/supabase-js'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { deriveLastMessagesMap } from '@/lib/last-messages'

/**
 * Rollback closure returned by optimistic update operations.
 *
 * Invoking this function restores the previous state snapshot captured
 * before the optimistic mutation was applied.
 */
type Rollback = () => void

/**
 * Public API returned by {@link useLastMessages}.
 *
 * This hook manages **derived conversation preview state**:
 * a mapping of `partnerId → last message`.
 *
 * It does NOT manage:
 * - full message lists
 * - message creation, editing, or deletion
 *
 * Instead, it reacts to:
 * - user intent (via optimistic calls from `useMessages`)
 * - authoritative database outcomes
 * - realtime reconciliation
 */
interface UseLastMessagesResult {
  /**
   * Map of `partnerId → last message`.
   *
   * If a conversation has no messages, it will not appear in this map.
   */
  lastMessages: Record<string, Message | null>

  /**
   * Loading state for the initial derivation of `lastMessages`
   * from the database.
   */
  loading: boolean

  /**
   * Error encountered while loading or rebuilding lastMessages.
   */
  error: PostgrestError | null

  /**
   * Optimistically inserts a new last message for a conversation.
   *
   * Intended to be called when a message is **sent or received**.
   */
  insertLastMessage: (message: Message) => void

  /**
   * Optimistically updates the last message text for a conversation.
   *
   * Returns a rollback closure that restores the previous preview state.
   */
  updateLastMessage: (id: string, text: string) => Rollback

  /**
   * Reconciles lastMessages after a message has been deleted.
   *
   * This operation is **authoritative** and may query the database
   * to determine the next most recent message.
   */
  deleteLastMessage: (message: Message) => Promise<void>

  /**
   * Explicitly replaces or removes the last message for a conversation.
   *
   * Acts as an escape hatch for:
   * - rollback after failed optimistic updates
   * - recomputation after destructive operations
   * - realtime reconciliation edge cases
   */
  replaceLastMessage: (partnerId: string, message: Message | null) => void
}

/**
 * useLastMessages
 *
 * A specialized hook responsible for maintaining **conversation preview state**
 * ("last message per conversation").
 *
 * Mental model:
 * - This hook owns **derived state**, not primary data.
 * - The source of truth is the `messages` table.
 * - This hook maintains a projection optimized for UI rendering
 *   (e.g. chat lists, inbox previews).
 *
 * Design principles:
 * - Optimistic where safe (create / edit)
 * - Authoritative where required (delete)
 * - Explicit rollback over implicit retries
 *
 * This hook is intentionally decoupled from message lists and
 * user intent; it reacts to higher-level orchestration from `useMessages`.
 */
export function useLastMessages(): UseLastMessagesResult {
  const [lastMessages, setLastMessages] = useState<
    Record<string, Message | null>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)

  const currentUserId = useChatlyStore((state) => state.user)?.id

  // populate lastMessages from the db
  useEffect(() => {
    if (!currentUserId) {
      setLastMessages({})
      setLoading(false)
      return
    }

    const fetchLastMessages = async () => {
      setLoading(true)

      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .order('created_at', { ascending: false })

        if (error) throw error
        setLastMessages(deriveLastMessagesMap(data, currentUserId))
        setError(null)
      } catch (error) {
        setError(error as PostgrestError)
        toast.error('Failed to load last messages')
        console.error('Error fetching last messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLastMessages()
  }, [currentUserId])

  /**
   * Updates the last message for a conversation when a new message is sent.
   *
   * This is a *fire-and-forget* optimistic update:
   * - Sending a message is a creation event, not a mutation of existing state.
   * - Rolling this back safely would require snapshotting prior state and
   *   coordinating with realtime updates, which is brittle and error-prone.
   *
   * In case the send fails, callers are responsible for restoring state
   * explicitly using `replaceLastMessage`, keeping rollback intentional
   * and localized to failure handling.
   */
  const insertLastMessage = useCallback(
    (message: Message) => {
      if (!currentUserId) return
      const partnerId = getPartnerId(message, currentUserId)

      setLastMessages((prev) => ({
        ...prev,
        [partnerId]: message,
      }))
    },
    [currentUserId],
  )

  /**
   * Updates the `lastMessages` aggregate after a message has been deleted.
   *
   * This function handles only the *derived conversation preview state*
   * (i.e. "last message per conversation"), not the message list itself.
   *
   * Behavior:
   * - If the deleted message was **not** the current last message for the conversation,
   *   no update is required and the function exits early.
   * - If the deleted message **was** the last message, the next most recent message
   *   must be determined from an authoritative source (the database).
   *   - If a previous message exists, it becomes the new last message.
   *   - If no previous message exists, the conversation entry is removed.
   *
   * @param deletedMsg The message that was successfully deleted from the database.
   */
  const deleteLastMessage = useCallback(
    async (deletedMsg: Message) => {
      if (!currentUserId) return
      const partnerId = getPartnerId(deletedMsg, currentUserId)
      const currentLastMsg = lastMessages[partnerId]

      // If deletedMessage is not the last message, do nothing
      if (deletedMsg.id !== currentLastMsg?.id) return

      // Rebuild from authoritative source
      const supabase = createClient()
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),` +
            `and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`,
        )
        .order('created_at', { ascending: false })
        .limit(1)

      const nextLastMsg = data?.[0] ?? null
      setLastMessages((prev) => {
        const next = { ...prev }

        if (nextLastMsg) {
          next[partnerId] = nextLastMsg
        } else {
          delete next[partnerId]
        }

        return next
      })
    },
    [currentUserId, lastMessages],
  )

  /**
   * Optimistically updates the last message preview when a message is edited.
   *
   * @param id - The id of the message being edited
   * @param text - The updated message text
   * @returns rollback - A rollback function that restores the previous last message state
   *
   *
   * This function performs a *targeted optimistic update*:
   * - It updates the last message **only if** the edited message is currently
   *   the last message for a conversation.
   * - Other conversations are left untouched.
   *
   * Rollback strategy:
   * - Before mutating state, a snapshot of the affected last message is captured.
   * - The function returns a rollback closure that restores the previous value.
   * - Callers are expected to invoke this rollback if the database update fails.
   *
   * This keeps rollback:
   * - Explicit (no hidden retries)
   * - Localized (only affects the touched conversation)
   * - Predictable (no recomputation or refetch required)
   */
  const updateLastMessage = useCallback((id: string, text: string) => {
    let rollbackSnapshot: { partnerId: string; message: Message } | null = null

    setLastMessages((prev) => {
      const next = { ...prev }

      for (const [partnerId, msg] of Object.entries(prev)) {
        if (msg?.id === id) {
          rollbackSnapshot = { partnerId, message: msg }
          next[partnerId] = {
            ...msg,
            text,
            updated_at: new Date().toISOString(),
          }
          break
        }
      }

      return next
    })

    // Rollback closure — restores the exact previous snapshot if needed
    return () => {
      if (!rollbackSnapshot) return

      setLastMessages((prev) => ({
        ...prev,
        [rollbackSnapshot!.partnerId]: rollbackSnapshot!.message,
      }))
    }
  }, [])

  /**
   * Escape hatch for cases like:
   * - rollback after failed optimistic update
   * - recompute after destructive delete
   * - realtime reconciliation
   */
  const replaceLastMessage = useCallback(
    (partnerId: string, message: Message | null) => {
      setLastMessages((prev) => {
        const next = { ...prev }

        if (message) {
          next[partnerId] = message
        } else {
          delete next[partnerId]
        }

        return next
      })
    },
    [],
  )

  return {
    lastMessages,
    loading,
    error,
    insertLastMessage,
    updateLastMessage,
    deleteLastMessage,
    replaceLastMessage,
  }
}

import { getPartnerId } from '@chatly/lib/messages'
import { derivePreview, derivePreviews } from '@chatly/lib/previews'
import type { Message } from '@chatly/types/message'
import type { Previews } from '@chatly/types/preview'
import { type PostgrestError, type SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import type { UsePreviewsResult } from '../types/use-previews'

/**
 * `usePreviews`
 *
 * Maintains a derived, read-optimized projection of conversation previews
 * based on message activity.
 *
 * This hook:
 * - builds previews from the authoritative messages table
 * - reflects the latest *activity* per conversation (send, receive, edit, delete)
 * - supports optimistic updates with freshness guards
 * - reconciles destructive operations authoritatively when required
 *
 * Consistency model:
 * - optimistic for inserts and updates
 * - authoritative for deletes and reconciliation
 *
 * Non-responsibilities:
 * - does not perform message CRUD
 * - does not decide how errors are surfaced in the UI
 * - does not contain presentation or formatting logic
 * - does not handle realtime logic. Since previews are derived
 * form messages, the `useMessages` hook handles and updates previews accordingly.
 *
 * The returned API is intended to be called by higher-level orchestration
 * (e.g. message hooks or realtime handlers), not directly by UI components.
 */
export function usePreviews(
  supabase: SupabaseClient,
  currentUserId: string | null,
): UsePreviewsResult {
  const [previews, setPreviews] = useState<Previews>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)

  /**
   * Populate previews from the db.
   * If no preview exists for a profile, no key is created for it in the state.
   */
  useEffect(() => {
    if (!currentUserId) {
      setPreviews({})
      setLoading(false)
      return
    }

    const fetchPreviews = async () => {
      setLoading(true)

      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`*, message_attachments (*)`)
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .order('updated_at', { ascending: false })

        if (error) throw error

        const normalizedMessages: Message[] = (data ?? []).map((row) => ({
          id: row.id,
          text: row.text,
          sender_id: row.sender_id,
          receiver_id: row.receiver_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          attachment: row.message_attachments?.[0],
        }))

        setPreviews(derivePreviews(normalizedMessages, currentUserId))
        setError(null)
      } catch (error) {
        setError(error as PostgrestError)
        console.error('Error fetching previews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreviews()
  }, [currentUserId, supabase])

  const updatePreview = useCallback(
    (message: Message) => {
      if (!currentUserId) return
      const partnerId = getPartnerId(message, currentUserId)

      setPreviews((prev) => {
        const existing = prev[partnerId]

        // Guard against stale updates
        if (existing?.updatedAt > message.updated_at) return prev

        return {
          ...prev,
          [partnerId]: derivePreview(message, currentUserId),
        }
      })
    },
    [currentUserId],
  )

  const deletePreview = useCallback(
    async (deletedMsg: Message) => {
      if (!currentUserId) return

      const partnerId = getPartnerId(deletedMsg, currentUserId)
      const currentPreview = previews[partnerId]

      // If the deleted message is not the last message, do nothing
      if (!currentPreview) return
      if (currentPreview?.updatedAt > deletedMsg.updated_at) return

      // Rebuild from authoritative source
      const { data: message, error } = await supabase
        .from('messages')
        .select(`*, message_attachments (*)`)
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),` +
            `and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`,
        )
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      setPreviews((prev) => {
        const next = { ...prev }

        if (message) {
          next[partnerId] = derivePreview(message, currentUserId)
        } else {
          delete next[partnerId]
        }

        return next
      })
    },
    [currentUserId, previews],
  )

  return {
    previews,
    loading,
    error,
    updatePreview,
    deletePreview,
  }
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getPartnerId } from '@/lib/dashboard'
import type { Message } from '@/types/message'
import { type PostgrestError } from '@supabase/supabase-js'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import type { Previews, UsePreviewsResult } from '@/types/use-previews'
import { derivePreview, derivePreviews } from '@/lib/previews'

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
 *
 * The returned API is intended to be called by higher-level orchestration
 * (e.g. message hooks or realtime handlers), not directly by UI components.
 */
export function usePreviews(): UsePreviewsResult {
  const [previews, setPreviews] = useState<Previews>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)

  const currentUserId = useChatlyStore((state) => state.user)?.id

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
        const supabase = createClient()

        const { data, error } = await supabase
          .from('messages')
          .select(`*, message_attachments (*)`)
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .order('updated_at', { ascending: false })

        if (error) throw error

        const normalizedMessages: Message[] = data.map((row) => ({
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
  }, [currentUserId])

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
      const supabase = createClient()
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

  /**
   * Escape hatch for authoritative preview replacement.
   *
   * This function bypasses freshness checks and optimistic safeguards.
   * Callers are expected to supply an authoritative message or `null`.
   *
   * Intended for:
   * - rollback after failed optimistic updates
   * - recomputation after destructive deletes
   * - realtime reconciliation when ordering guarantees are violated
   */
  const replacePreview = useCallback(
    (partnerId: string, message: Message | null) => {
      if (!currentUserId) return

      setPreviews((prev) => {
        const next = { ...prev }

        if (message) next[partnerId] = derivePreview(message, currentUserId)
        else delete next[partnerId]

        return next
      })
    },
    [currentUserId],
  )

  return {
    previews,
    loading,
    error,
    updatePreview,
    deletePreview,
    replacePreview,
  }
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { type Message } from '@/types/message'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { type PostgrestError } from '@supabase/supabase-js'
import { getPartnerId } from '@/lib/dashboard'
import type {
  SendMessageInput,
  UseMessagesArgs,
  UseMessagesResult,
} from '@/types/use-messages'
import type { MessageAttachment } from '@/types/message-attachment'
import { checkAndIncrementUsage } from '@/app/actions'

/**
 * useMessages
 *
 * High-level messaging hook responsible for:
 * - fetching messages for the active conversation
 * - managing optimistic UI for send/edit/delete
 * - reconciling authoritative database state
 * - reacting to realtime message and attachment events
 *
 * Architectural principles:
 * - `messages` is authoritative for the active conversation
 * - previews are updated via injected callbacks (event-style)
 * - optimistic UI is applied only to `messages`, never to previews directly
 *
 * Realtime guarantees:
 * - Messages and attachments sent by other users appear without refresh
 * - Attachments may arrive after the message and are reconciled incrementally
 *
 * @param selectedProfileId The active conversation partner, or null
 * @param updatePreview Callback invoked when a conversation preview must be updated
 * @param deletePreview Callback invoked when a conversation preview must be removed
 */
export function useMessages({
  selectedProfileId,
  updatePreview,
  deletePreview,
}: UseMessagesArgs): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<PostgrestError | null>(null)
  const currentUserId = useChatlyStore((state) => state.user)?.id

  /**
   * Fetch messages when the selected conversation changes.
   */
  useEffect(() => {
    if (!currentUserId || !selectedProfileId) {
      setMessages([])
      setLoading(false)
      return
    }

    const supabase = createClient()

    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError(null)

        const filter = [
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedProfileId})`,
          `and(sender_id.eq.${selectedProfileId},receiver_id.eq.${currentUserId})`,
        ].join(',')

        const { data, error } = await supabase
          .from('messages')
          .select(`*, message_attachments (*)`)
          .or(filter)
          .order('created_at', { ascending: true })

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

        setMessages(normalizedMessages)
      } catch (error) {
        setError(error as PostgrestError)
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [currentUserId, selectedProfileId])

  /**
   * Handle realtime events on messages.
   *
   * Messages are the authoritative unit of conversation state.
   * Attachments may arrive later via a separate realtime channel.
   */
  useEffect(() => {
    if (!currentUserId) return
    const supabase = createClient()

    const channel = supabase
      .channel('messages:realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        async (payload) => {
          switch (payload.eventType) {
            case 'INSERT': {
              const msg = payload.new as Message

              /**
               * Gate: ignore realtime echo if this message already exists locally
               * (covers optimistic sends and same-device self chats)
               */
              if (messages.some((m) => m.id === msg.id)) return

              const partnerId = getPartnerId(msg, currentUserId)

              if (partnerId === selectedProfileId) {
                setMessages((prev) => [...prev, msg])
              }

              updatePreview(msg)
              break
            }

            case 'UPDATE': {
              const incomingMsg = payload.new as Message

              /**
               * Gate for edge cases involving optimistic updates and cross device
               * sync for the same user.
               */
              const localMsg = messages.find((m) => m.id === incomingMsg.id)
              if (localMsg && incomingMsg.updated_at < localMsg.updated_at) {
                return
              }

              const partnerId = getPartnerId(incomingMsg, currentUserId)

              if (partnerId === selectedProfileId) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === incomingMsg.id ? incomingMsg : m)),
                )
              }

              updatePreview(incomingMsg)
              break
            }

            case 'DELETE': {
              const deletedId = payload.old.id as string

              setMessages((prev) => prev.filter((m) => m.id !== deletedId))

              const deletedMessage = messages.find((m) => m.id === deletedId)
              if (deletedMessage) {
                try {
                  await deletePreview(deletedMessage)
                } catch (error) {
                  console.warn('Realtime messages preview delete failed', error)
                }
              }

              break
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, deletePreview, messages, selectedProfileId, updatePreview])

  /**
   * Handle realtime events on message_attachments.
   *
   * Attachments are treated as enrichments to existing messages:
   * - INSERT attaches a file to an already-known message
   * - DELETE removes the attachment but does NOT delete the message
   *
   * This allows attachments to arrive after the message itself
   * without requiring a refetch or refresh.
   */
  useEffect(() => {
    if (!currentUserId) return
    const supabase = createClient()

    const channel = supabase
      .channel('message_attachments:realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_attachments',
        },
        async (payload) => {
          switch (payload.eventType) {
            case 'INSERT': {
              const attachment = payload.new as MessageAttachment

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === attachment.message_id
                    ? { ...msg, attachment }
                    : msg,
                ),
              )

              const relatedMsg = messages.find(
                (msg) => msg.id === attachment.message_id,
              )

              if (relatedMsg) {
                updatePreview({ ...relatedMsg, attachment })
              }

              break
            }

            case 'DELETE': {
              const deletedId = payload.old.id as string

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.attachment?.id === deletedId
                    ? { ...msg, attachment: undefined }
                    : msg,
                ),
              )

              const relatedMsg = messages.find(
                (msg) => msg.attachment?.id === deletedId,
              )

              if (relatedMsg) {
                updatePreview({ ...relatedMsg, attachment: undefined })
              }

              break
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, messages, updatePreview])

  /**
   * Creates an attachment for an existing message.
   *
   * This performs two operations:
   * 1. Uploads the file to object storage
   * 2. Inserts a row into the `message_attachments` table
   *
   * The attachment will later be reconciled via realtime for other clients.
   *
   * @throws PostgrestError if either upload or DB insert fails
   */
  const createMessageAttachment = useCallback(
    async (messageId: string, file: File): Promise<MessageAttachment> => {
      const supabase = createClient()
      const path = `${messageId}/${uuidv4()}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message_attachments')
        .upload(path, file)

      if (uploadError) throw uploadError

      const { data: attachment, error: insertError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: messageId,
          path: uploadData.path,
          file_name: file.name,
          mime_type: file.type,
          size: file.size,
        })
        .select()
        .single()

      if (insertError) throw insertError

      return attachment
    },
    [],
  )

  /**
   * Only removes the attachment file from the bucket.
   * The row in the message_attachments table is deleted via cascade on the messages table.
   */
  const deleteAttachmentFile = useCallback(
    async (attachment: MessageAttachment) => {
      const supabase = createClient()

      const { error } = await supabase.storage
        .from('message_attachments')
        .remove([attachment.path])

      if (error) throw error
    },
    [],
  )

  /**
   * Reconciles an optimistic message with its authoritative database version.
   *
   * Replaces the temporary message (identified by `tempId`) with the
   * confirmed message returned by the database, and updates previews
   * based on the final state.
   *
   * This function is intentionally local to `useMessages.sendMessage` and is not exposed.
   */
  const reconcileOptimisticMessage = useCallback(
    (tempId: string, finalMessage: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? finalMessage : m)),
      )

      updatePreview(finalMessage)
    },
    [updatePreview],
  )

  /**
   * Sends a message to the active conversation.
   *
   * Behavior:
   * 1. Optimistically inserts a temporary message into `messages`
   * 2. Persists the message to the database
   * 3. Reconciles the optimistic message with the confirmed version
   * 4. Updates previews only after authoritative success
   *
   * Attachments are uploaded only after message creation succeeds.
   *
   * `message_attachmens` has an updating role. It only ever updates
   * an already existing message.
   */
  const sendMessage = useCallback(
    async ({ text, file }: SendMessageInput) => {
      if (!currentUserId || !selectedProfileId) return

      const hasText = typeof text === 'string' && text.trim().length > 0
      const hasFile = !!file
      if (!hasText && !hasFile) return

      const tempId = uuidv4()
      const now = new Date().toISOString()

      const optimisticMessage: Message = {
        id: tempId,
        text: text ?? null,
        sender_id: currentUserId,
        receiver_id: selectedProfileId,
        created_at: now,
        updated_at: now,
        attachment: file
          ? {
              id: 'optimistic',
              message_id: tempId,
              path: '',
              file_name: file.name,
              mime_type: file.type,
              size: file.size,
              created_at: now,
            }
          : undefined,
      }

      // 1. Optimistic UI update
      setMessages((prev) => [...prev, optimisticMessage])

      // 2. Authoritative DB insert
      const supabase = createClient()
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          text: text ?? null,
          sender_id: currentUserId,
          receiver_id: selectedProfileId,
        })
        .select()
        .single()

      // 3. DB failure → rollback and exit
      if (error) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        console.error('Error sending message:', error)
        throw error
      }

      // 4. Upload attachment only if db insert succeeds
      if (file) {
        let attachment: MessageAttachment | null = null

        try {
          attachment = await createMessageAttachment(message.id, file)

          /**
           * Media usage is incremented **after** a successful upload.
           *
           * Unlike AI calls, failed storage uploads do not incur cost.
           * By checking usage only after the file is safely stored, we ensure:
           * - Only successful uploads count toward the usage limit
           * - Failed or rolled-back uploads are never charged
           *
           * This avoids overcounting while keeping rollback simple.
           */
          await checkAndIncrementUsage('media')

          reconcileOptimisticMessage(tempId, { ...message, attachment })
        } catch (error) {
          console.error(error)
          setMessages((prev) => prev.filter((m) => m.id !== tempId))

          // delete everything regarding the message
          await supabase.from('messages').delete().eq('id', message.id) // deletes message_attachment on cascade
          if (attachment) deleteAttachmentFile(attachment)

          throw error
        }

        return
      }

      // 5. Update previews after confirmed success
      reconcileOptimisticMessage(tempId, message)
    },
    [
      createMessageAttachment,
      currentUserId,
      deleteAttachmentFile,
      reconcileOptimisticMessage,
      selectedProfileId,
    ],
  )

  /**
   * Deletes a message by id.
   *
   * Guarantees:
   * - Message is removed optimistically from local state
   * - Database deletion is authoritative
   * - Associated attachment rows are deleted via ON DELETE CASCADE
   *
   * Best-effort behavior:
   * - The attachment file is removed from storage if present
   * - Storage cleanup failures do NOT rollback message deletion
   */
  const deleteMessage = useCallback(
    async (id: string) => {
      if (!currentUserId) return

      const msg = messages.find((msg) => msg.id === id)
      if (!msg) return

      const prevMessages = messages
      const attachment = msg.attachment

      // 1. Optimistic UI update
      setMessages((prev) => prev.filter((m) => m.id !== id))

      // 2. Authoritative DB delete
      const supabase = createClient()
      const { error } = await supabase.from('messages').delete().eq('id', id)

      // 3. DB failure → rollback and exit
      if (error) {
        setMessages(prevMessages)
        console.error('Error deleting message:', error)
        throw error
      }

      // 4. Best-effort storage cleanup (non-authoritative)
      if (attachment) {
        try {
          await deleteAttachmentFile(attachment)
        } catch (error) {
          console.warn('Storage cleanup failed', error)
        }
      }

      // 5. Update previews after confirmed success
      const deletedMessage = prevMessages.find((msg) => msg.id === id)
      if (deletedMessage) await deletePreview(deletedMessage)
    },
    [currentUserId, deleteAttachmentFile, deletePreview, messages],
  )

  /**
   * Edits the text of an existing message.
   *
   * Notes:
   * - Only text is editable; attachments are immutable
   * - `updated_at` is optimistically updated, then reconciled with DB
   */
  const editMessage = useCallback(
    async (id: string, text: string) => {
      const prevMessages = messages

      // 1. Optimistic UI update
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id
            ? { ...msg, text, updated_at: new Date().toISOString() }
            : msg,
        ),
      )

      // 2. Authoritative DB update
      const supabase = createClient()
      const { data: updatedMessage, error } = await supabase
        .from('messages')
        .update({ text })
        .eq('id', id)
        .select()
        .single()

      // 3. DB failure → rollback and exit
      if (error) {
        setMessages(prevMessages)
        console.error('Error updating message:', error)
        throw error
      }

      // 4. Reconcile messages
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg,
        ),
      )

      // 5. Update previews after confirmed success
      updatePreview(updatedMessage)
    },
    [messages, updatePreview],
  )

  return {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
  }
}

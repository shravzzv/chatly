import { getPartnerId } from '@chatly/lib/messages'
import type { Message } from '@chatly/types/message'
import type { MessageAttachment } from '@chatly/types/message-attachment'
import { type PostgrestError } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  NativeFile,
  SendMessageInput,
  UseMessagesArgs,
  UseMessagesResult,
} from '../types/use-messages'

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
 */
export function useMessages({
  supabase,
  currentUserId,
  selectedProfileId,
  updatePreview,
  deletePreview,
  generateId,
}: UseMessagesArgs): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<PostgrestError | null>(null)

  const messagesRef = useRef<Message[]>(messages)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  /**
   * Fetch messages when the selected conversation changes.
   */
  useEffect(() => {
    if (!currentUserId || !selectedProfileId) {
      setMessages([])
      setLoading(false)
      return
    }

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

        const normalizedMessages: Message[] = (data ?? []).map((row) => ({
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
  }, [currentUserId, selectedProfileId, supabase])

  /**
   * Handle realtime events on messages.
   *
   * Messages are the authoritative unit of conversation state.
   * Attachments may arrive later via a separate realtime channel.
   */
  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase
      .channel('messages:realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const msg = (payload.new || payload.old) as Message

          if (payload.eventType !== 'DELETE') {
            const isRelevant =
              msg.receiver_id === currentUserId ||
              msg.sender_id === currentUserId

            if (!isRelevant) return
          }

          switch (payload.eventType) {
            case 'INSERT': {
              const partnerId = getPartnerId(msg, currentUserId)

              if (partnerId === selectedProfileId) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === msg.id)) return prev

                  return [...prev, msg]
                })
              }

              updatePreview(msg)
              break
            }

            case 'UPDATE': {
              /**
               * Gate for edge cases involving optimistic updates and cross device
               * sync for the same user.
               */
              const localMsg = messagesRef.current.find((m) => m.id === msg.id)
              if (localMsg && msg.updated_at < localMsg.updated_at) return

              const partnerId = getPartnerId(msg, currentUserId)
              if (partnerId === selectedProfileId) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)),
                )
              }

              updatePreview(msg)
              break
            }

            case 'DELETE': {
              const deletedId = payload.old.id as string

              setMessages((prev) => prev.filter((m) => m.id !== deletedId))

              const deletedMessage = messagesRef.current.find(
                (m) => m.id === deletedId,
              )
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
  }, [currentUserId, deletePreview, selectedProfileId, updatePreview, supabase])

  /**
   * Handle realtime events on message_attachments.
   *
   * Attachments are treated as enrichments to existing messages:
   * - INSERT attaches a file to an already-known message
   * - DELETE removes the attachment but does NOT delete the message
   * - There is no UPDATE for message attachments.
   *
   * This allows attachments to arrive after the message itself
   * without requiring a refetch or refresh.
   */
  useEffect(() => {
    if (!currentUserId) return

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

              const msg = messagesRef.current.find(
                (m) => m.id === attachment.message_id,
              )
              if (msg) updatePreview({ ...msg, attachment })
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

              const msg = messagesRef.current.find(
                (m) => m.attachment?.id === deletedId,
              )
              if (msg) updatePreview({ ...msg, attachment: undefined })
              break
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, updatePreview, supabase])

  const uploadAttachmentFile = useCallback(
    async (path: string, file: File | NativeFile) => {
      const isNativeFileUpload = !(file instanceof File)

      const { data, error } = await supabase.storage
        .from('message_attachments')
        .upload(path, isNativeFileUpload ? file.arrayBuffer : file, {
          contentType: isNativeFileUpload ? file.mimeType : undefined,
        })

      if (error) throw error
      return data
    },
    [supabase],
  )

  const deleteAttachmentFile = useCallback(
    async (path: string) => {
      const { error } = await supabase.storage
        .from('message_attachments')
        .remove([path])

      if (error) throw error
    },
    [supabase],
  )

  /**
   * Reconciles an optimistic message with its authoritative database version.
   *
   * Replaces the temporary message with the
   * confirmed message returned by the database, and updates previews
   * based on the final state.
   *
   * This function is intentionally local to {@link sendMessage} and is not exposed.
   */
  const reconcileOptimisticMessage = useCallback(
    (messageId: string, finalMsg: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...finalMsg } : m)),
      )
      updatePreview(finalMsg)
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

      const messageId = generateId()
      const now = new Date().toISOString()
      const isNativeFileUpload = !(file instanceof File)

      const optimisticMessage: Message = {
        id: messageId,
        text: text ?? null,
        sender_id: currentUserId,
        receiver_id: selectedProfileId,
        created_at: now,
        updated_at: now,
        attachment: file
          ? {
              id: 'optimistic', // used as identifier
              message_id: messageId,
              path: '',
              file_name: file.name,
              mime_type: isNativeFileUpload ? file.mimeType : file.type,
              size: file.size,
              created_at: now,
            }
          : undefined,
      }

      // 1. Optimistic UI update
      setMessages((prev) => [...prev, optimisticMessage])

      // 2. Authoritative DB insert
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          text: text ?? null,
          sender_id: currentUserId,
          receiver_id: selectedProfileId,
        })
        .select()
        .single()

      // 3. DB failure → rollback and exit
      if (error) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
        console.error('Error sending message:', error)
        throw error
      }

      // 4. Upload and handle attachment only if db insert succeeds
      if (file) {
        const path = `${message.id}/${generateId()}`

        try {
          // RLS ensures that only authenticated users can insert attachments only for messages they own
          const uploadedFileData = await uploadAttachmentFile(path, file)
          if (!uploadedFileData) throw Error('File upload failed')

          const fileData = {
            path: uploadedFileData.path,
            name: file.name,
            size: file.size,
            mimeType: isNativeFileUpload ? file.mimeType : file.type,
          }

          /**
           * Server side authoritative because this is a paid feature.
           * Abstracts checking and incrementing usage as well.
           */
          const { data, error } = await supabase.functions.invoke(
            'create-msg-attachment',
            {
              body: { messageId: message.id, fileData },
            },
          )

          if (error) throw error
          if (data.error) throw new Error(data.error)

          const attachment = data.attachment
          reconcileOptimisticMessage(messageId, { ...message, attachment })
        } catch (error) {
          console.error(error)

          /**
           * Messages are safe to delete because messages and attachments have an
           * either...or relationship.
           * A message created for an attachment will be an empty shell if no attachment exists.
           */
          setMessages((prev) => prev.filter((m) => m.id !== messageId))

          /**
           * Delete everything regarding that message from the db.
           */
          await supabase.from('messages').delete().eq('id', message.id) // deletes message_attachment on cascade
          await deleteAttachmentFile(path)

          throw error
        }

        return
      }

      // 5. Update previews after confirmed success
      reconcileOptimisticMessage(messageId, message)
    },
    [
      currentUserId,
      deleteAttachmentFile,
      reconcileOptimisticMessage,
      selectedProfileId,
      uploadAttachmentFile,
      supabase,
      generateId,
    ],
  )

  /**
   * Deletes a message by id.
   *
   * Guarantees:
   * - Message is removed optimistically from local state
   * - Database deletion is authoritative
   * - Associated message attachment rows are deleted via ON DELETE CASCADE
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
          await deleteAttachmentFile(attachment.path)
        } catch (error) {
          console.warn('Storage cleanup failed', error)
        }
      }

      // 5. Update previews after confirmed db success
      const deletedMessage = prevMessages.find((msg) => msg.id === id)
      if (deletedMessage) await deletePreview(deletedMessage)
    },
    [currentUserId, deleteAttachmentFile, deletePreview, messages, supabase],
  )

  /**
   * Edits the text of an existing message.
   *
   * Notes:
   * - **Only text is editable; attachments are immutable**
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

      // 5. Update previews after confirmed db success
      updatePreview(updatedMessage)
    },
    [messages, updatePreview, supabase],
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

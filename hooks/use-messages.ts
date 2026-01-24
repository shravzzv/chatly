'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { type Message } from '@/types/message'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { type PostgrestError } from '@supabase/supabase-js'
import { useLastMessages } from '@/hooks/use-last-messages'
import { getPartnerId } from '@/lib/dashboard'

/**
 * Public API returned by {@link useMessages}.
 *
 * This hook intentionally exposes **commands** (send/edit/delete)
 * alongside **derived state** (messages, lastMessages).
 *
 * The caller should treat:
 * - `messages` as the authoritative list for the active conversation
 * - `lastMessages` as a derived preview cache for conversation lists
 */
interface UseMessagesResult {
  /** Messages for the currently selected conversation */
  messages: Message[]

  /** Loading state for the initial fetch of messages */
  loading: boolean

  /** Error state for message fetching */
  error: PostgrestError | null

  /**
   * Sends a new message to the selected profile.
   *
   * This method is **optimistic**:
   * - The message appears immediately in `messages`
   * - The conversation preview (`lastMessages`) updates immediately
   * - A temporary id is used until the database confirms the insert
   *
   * On failure:
   * - The optimistic message is removed
   * - The previous `lastMessages` entry is restored explicitly
   */
  sendMessage: (text: string) => Promise<void>

  /**
   * Deletes a message by id.
   *
   * This method is **optimistic for the message list**, but
   * **authoritative for `lastMessages`**:
   * - The message is removed from `messages` immediately
   * - `lastMessages` is only updated *after* the database confirms deletion
   */
  deleteMessage: (id: string) => Promise<void>

  /**
   * Edits the text of an existing message.
   *
   * This method uses **optimistic update with rollback**:
   * - The message text updates immediately in `messages`
   * - The conversation preview updates optimistically
   * - A rollback closure restores prior state if the DB update fails
   */
  editMessage: (id: string, text: string) => Promise<void>

  /**
   * Map of `partnerId -> last message`.
   *
   * This is a **derived projection** maintained by {@link useLastMessages}
   * and kept in sync via:
   * - local optimistic actions
   * - realtime database events
   */
  lastMessages: Record<string, Message | null>

  /** Loading state for the initial `lastMessages` derivation */
  lastMessagesLoading: boolean
}

/**
 * useMessages
 *
 * A high-level messaging hook responsible for:
 * - fetching messages for the active conversation
 * - managing optimistic UI for send/edit/delete
 * - subscribing to realtime database changes
 * - coordinating with {@link useLastMessages} to keep conversation previews in sync
 *
 * Architectural responsibilities:
 * - **Commands**: send/edit/delete messages (user intent)
 * - **Reconciliation**: apply realtime events (database facts)
 *
 * This hook deliberately separates:
 * - intent-driven mutations (user actions)
 * - event-driven reconciliation (realtime updates)
 *
 * @param selectedProfileId The currently active chat partner, or null
 */
export function useMessages(
  selectedProfileId: string | null,
): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<PostgrestError | null>(null)
  const currentUserId = useChatlyStore((state) => state.user)?.id
  const {
    lastMessages,
    loading: lastMessagesLoading,
    insertLastMessage,
    deleteLastMessage,
    updateLastMessage,
    replaceLastMessage,
  } = useLastMessages()

  /**
   * Fetch messages when the selected conversation changes.
   */
  useEffect(() => {
    if (!currentUserId || !selectedProfileId) {
      setMessages([])
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
          .select('*')
          .or(filter)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(data)
      } catch (error) {
        setError(error as PostgrestError)
        toast.error('Failed to load messages')
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [currentUserId, selectedProfileId])

  /**
   * Handle realtime events on messages.
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

              insertLastMessage(msg)
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

              updateLastMessage(incomingMsg.id, incomingMsg.text)
              break
            }

            case 'DELETE': {
              const deletedId = payload.old.id as string

              setMessages((prev) => prev.filter((m) => m.id !== deletedId))

              const deletedMessage = messages.find((m) => m.id === deletedId)
              if (deletedMessage) {
                await deleteLastMessage(deletedMessage)
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
  }, [
    currentUserId,
    selectedProfileId,
    messages,
    insertLastMessage,
    deleteLastMessage,
    updateLastMessage,
  ])

  /**
   * Sends a new message to the active conversation.
   *
   * Optimistic behavior:
   * - A temporary message is inserted immediately
   * - Conversation preview updates immediately
   *
   * Failure handling:
   * - Removes the optimistic message
   * - Restores the previous conversation preview explicitly
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !currentUserId || !selectedProfileId) return

      const tempId = uuidv4()
      const now = new Date().toISOString()

      const optimisticMessage: Message = {
        id: tempId,
        text,
        sender_id: currentUserId,
        receiver_id: selectedProfileId,
        created_at: now,
        updated_at: now,
      }

      const prevLastMessage = lastMessages[selectedProfileId] ?? null

      setMessages((prev) => [...prev, optimisticMessage])
      insertLastMessage(optimisticMessage)

      const supabase = createClient()
      const { data, error } = await supabase
        .from('messages')
        .insert({
          text,
          sender_id: currentUserId,
          receiver_id: selectedProfileId,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        replaceLastMessage(selectedProfileId, prevLastMessage)
        toast.error('Failed to send message')
        console.error('Error sending message:', error)
        return
      }

      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
      insertLastMessage(data)
    },
    [
      currentUserId,
      lastMessages,
      insertLastMessage,
      replaceLastMessage,
      selectedProfileId,
    ],
  )

  /**
   * Deletes a message by id.
   *
   * This method:
   * - Optimistically removes the message from the local list
   * - Commits the deletion to the database
   * - Updates conversation previews only after DB success
   */
  const deleteMessage = useCallback(
    async (id: string) => {
      if (!currentUserId) return

      const prevMessages = messages

      setMessages((prev) => prev.filter((msg) => msg.id !== id))

      const supabase = createClient()
      const { error } = await supabase.from('messages').delete().eq('id', id)

      if (error) {
        setMessages(prevMessages)
        toast.error('Failed to delete message')
        console.error('Error deleting message:', error)
        return
      }

      // Intentionally updating lastMessages only after db update succeeds.
      const deletedMessage = prevMessages.find((msg) => msg.id === id)
      if (deletedMessage) await deleteLastMessage(deletedMessage)

      toast.success('Message deleted')
    },
    [currentUserId, messages, deleteLastMessage],
  )

  /**
   * Edits the text of an existing message.
   *
   * This method uses **optimistic update with explicit rollback**:
   * - Message text updates immediately
   * - Conversation preview updates optimistically
   * - A rollback closure restores preview state if the DB update fails
   */
  const editMessage = useCallback(
    async (id: string, text: string) => {
      const prevMessages = messages

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id
            ? { ...msg, text, updated_at: new Date().toISOString() }
            : msg,
        ),
      )

      const rollbackLastMessage = updateLastMessage(id, text)

      const supabase = createClient()
      const { data, error } = await supabase
        .from('messages')
        .update({ text })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        setMessages(prevMessages)
        rollbackLastMessage()
        toast.error('Failed to update message')
        console.error('Error updating message:', error)
        return
      }

      setMessages((prev) => prev.map((msg) => (msg.id === id ? data : msg)))
      updateLastMessage(id, data.text)

      toast.success('Message updated')
    },
    [messages, updateLastMessage],
  )

  return {
    messages,
    loading,
    error,
    sendMessage,
    deleteMessage,
    editMessage,
    lastMessages,
    lastMessagesLoading,
  }
}

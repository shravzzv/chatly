'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { toast } from 'sonner'
import { Message } from '@/types/message'
import { Profile } from '@/types/profile'
import { createClient } from '@/utils/supabase/client'
import type {
  RealtimePostgresChangesPayload,
  RealtimePostgresDeletePayload,
} from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCheckoutUrl } from '@/lib/get-checkout-url'
import { Billing, Plan } from '@/types/subscription'
import { getPartnerId } from '@/lib/dashboard'
import DashboardSkeleton from '@/components/dashboard-skeleton'
import { useTypingIndicator } from '@/hooks/use-typing-indicator'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import ChatPanel from '@/components/chat-panel'
import ConversationsPanel from '@/components/conversations-panel'
import ConversationSelectDialog from '@/components/conversation-select-dialog'

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // state variables
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [lastMessagesLoading, setLastMessagesLoading] = useState(true)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    () => searchParams.get('senderId'),
  )
  const [isProfileSelectDialogOpen, setIsProfileSelectDialogOpen] =
    useState(false)
  const [lastMessages, setLastMessages] = useState<
    Record<string, Message | null>
  >({})

  // memoized variables
  const selectedProfile = useMemo(
    () => profiles.find((p) => p.user_id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  )
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  // Memoized so it can be safely used in effect dependencies without causing re-runs

  // state variables from custom hooks
  const isMobileView = useIsMobile()
  const { isTyping, updateTypingStatus } = useTypingIndicator(selectedProfileId)

  const currentUser = useChatlyStore((state) => state.user)

  // refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // derived variables
  const plan = searchParams.get('plan')
  const billing = searchParams.get('billing')

  const filteredProfiles = searchQuery
    ? profiles.filter((p) => {
        const name = p.name?.toLowerCase() || ''
        const username = p.username?.toLowerCase() || ''
        return name.includes(searchQuery) || username.includes(searchQuery)
      })
    : profiles

  // derived functions
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (value.trim()) {
      updateTypingStatus(true)
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(false)
      }, 3000)
    } else {
      updateTypingStatus(false)
    }
  }

  const handleSubmitMessage = async () => {
    if (!message.trim() || !selectedProfileId || !currentUser) return

    updateTypingStatus(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    const tempId = uuidv4()
    const now = new Date().toISOString()

    const newMessage: Message = {
      id: tempId,
      text: message,
      sender_id: currentUser.id,
      receiver_id: selectedProfileId,
      created_at: now,
      updated_at: now,
    }

    // Optimistic UI update
    setMessages((prev) => [...prev, newMessage])
    const oldLastMessage = lastMessages[selectedProfileId]
    setLastMessages((prev) => ({
      ...prev,
      [selectedProfileId]: newMessage,
    }))
    setMessage('')
    setTimeout(scrollToBottom, 100)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({
        text: message,
        sender_id: currentUser.id,
        receiver_id: selectedProfileId,
        created_at: now,
        updated_at: now,
        //? should this be an array or an object?
        // ? what happens if we put an id: tempId here? That's the only difference between the newMessage and the message stored in the db.
      })
      .select()
      .single()

    if (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
      setLastMessages((prev) => {
        const updated = { ...prev }
        updated[selectedProfileId] = oldLastMessage
        return updated
      })
      toast.error('Failed to send message')
      console.error('Error sending message:', error)
      return
    }

    // Replace temp message with real DB message
    setMessages((prev) => prev.map((msg) => (msg.id === tempId ? data : msg)))
    setLastMessages((prev) => ({
      ...prev,
      [selectedProfileId]: data,
    }))
  }

  const handleDeleteMessage = async (id: string) => {
    if (!currentUser) return
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

    // Check if deleted message was the last one for this chat
    // todo: since tihs part is being shared with the useEffect, modularize it
    const deletedMessage = prevMessages.find((msg) => msg.id === id)
    if (deletedMessage) {
      const otherId =
        deletedMessage.sender_id === currentUser.id
          ? deletedMessage.receiver_id
          : deletedMessage.sender_id

      // Find the most recent message in this conversation (after deletion)
      const remainingMessages = prevMessages
        .filter(
          (msg) =>
            msg.id !== id &&
            ((msg.sender_id === currentUser.id &&
              msg.receiver_id === otherId) ||
              (msg.sender_id === otherId &&
                msg.receiver_id === currentUser.id)),
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )

      const newLastMessage = remainingMessages[0] || null

      setLastMessages((prev) => {
        const updated = { ...prev }
        if (newLastMessage) {
          updated[otherId] = newLastMessage
        } else {
          delete updated[otherId]
        }
        return updated
      })
    }

    toast.success('Message deleted')
  }

  const handleEditMessage = async (id: string, updatedText: string) => {
    const prevMessages = messages

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...msg, text: updatedText, updated_at: new Date().toISOString() }
          : msg,
      ),
    )

    // If this message is the last message for the relevant user, update lastMessages too
    setLastMessages((prev) => {
      const updated = { ...prev }
      for (const [userId, msg] of Object.entries(prev)) {
        if (msg?.id === id) {
          updated[userId] = { ...msg, text: updatedText }
        }
      }
      return updated
    })

    const supabase = createClient()
    const { error } = await supabase
      .from('messages')
      .update({ text: updatedText })
      .eq('id', id)

    if (error) {
      setMessages(prevMessages)
      toast.error('Failed to update message')
      console.error('Error updating message:', error)
      return
    }

    toast.success('Message updated')
  }

  // effects

  // Navigate the user to the checkout page when they've signed up through the pricing page to ensure continuity
  useEffect(() => {
    if (!currentUser || !plan || !billing) return

    const checkoutUrl = getCheckoutUrl(
      plan as Plan,
      billing as Billing,
      currentUser,
    )

    if (checkoutUrl) router.replace(checkoutUrl)
  }, [currentUser, plan, billing, router])

  // Fetch all profiles
  useEffect(() => {
    const supabase = createClient()

    const fetchProfiles = async () => {
      setProfilesLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching profiles:', error)
        toast.error('Failed to load profiles')
        return
      }

      setProfiles(data)
      setProfilesLoading(false)
    }

    fetchProfiles()
  }, [])

  // Fetch messages when selectedProfileId changes
  useEffect(() => {
    if (!selectedProfileId || !currentUser) return
    const supabase = createClient()

    const fetchMessages = async () => {
      setMessagesLoading(true)

      // Fetch messages where the currentUser and the selectedProfileId are the participants
      const condition = [
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedProfileId})`,
        `and(sender_id.eq.${selectedProfileId},receiver_id.eq.${currentUser.id})`,
      ].join(',')

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(condition)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        toast.error('Failed to load messages')
        return
      }

      setMessages(data)
      setTimeout(scrollToBottom, 100)
      setMessagesLoading(false)
    }

    fetchMessages()
  }, [selectedProfileId, currentUser, scrollToBottom])

  // Fetch last messages for all profiles
  useEffect(() => {
    if (!currentUser) return
    const supabase = createClient()

    const fetchLastMessages = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })
      // ordering in the descending order of created_at is required to find the last messages

      if (error) {
        console.error('Error fetching last messages:', error)
        setLastMessagesLoading(false)
        return
      }

      const map: Record<string, Message> = {}

      for (const msg of messages) {
        const partnerId = getPartnerId(msg, currentUser.id)
        if (!map[partnerId]) map[partnerId] = msg
      }

      setLastMessages(map)
      setLastMessagesLoading(false)
    }

    fetchLastMessages()
  }, [currentUser])

  // Listen to incoming realtime INSERT & UPDATE events on the messages table and update the state accordingly
  useEffect(() => {
    if (!currentUser) return
    const supabase = createClient()

    const handlePayload = (
      payload: RealtimePostgresChangesPayload<Message>,
    ) => {
      const msg = (payload.new ?? payload.old) as Message
      const partnerId = getPartnerId(msg, currentUser.id)

      // update last messages
      switch (payload.eventType) {
        case 'INSERT': {
          const newMsg = payload.new as Message

          if (newMsg.sender_id === currentUser.id) return

          setLastMessages((prev) => ({
            ...prev,
            [partnerId]: newMsg,
          }))

          break
        }

        case 'UPDATE': {
          const updatedMsg = payload.new as Message

          setLastMessages((prev) => {
            if (updatedMsg.id === prev[partnerId]?.id) {
              return {
                ...prev,
                [partnerId]: updatedMsg,
              }
            }

            return prev
          })

          break
        }

        default: {
          break
        }
      }

      // update messages only if it's related to the selectedProfileId
      if (!selectedProfileId) return
      const isMsgInCurrentChat = selectedProfileId === partnerId

      switch (payload.eventType) {
        case 'INSERT': {
          const newMsg = payload.new as Message

          // Ignore messages sent by me to reconcile with handleSubmitMessage
          if (newMsg.sender_id === currentUser.id) return

          if (isMsgInCurrentChat) {
            setMessages((prev) => [...prev, newMsg])
            setTimeout(scrollToBottom, 100)
          }

          break
        }

        case 'UPDATE': {
          const updatedMsg = payload.new as Message

          if (isMsgInCurrentChat) {
            setMessages((prev) =>
              prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)),
            )
          }

          break
        }

        default: {
          break
        }
      }
    }

    const channel = supabase
      .channel('messages-inserts-and-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        handlePayload,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser, selectedProfileId, scrollToBottom])

  // Listen to realtime DELETE events on the messages table and update the state accordingly
  useEffect(() => {
    if (!currentUser) return
    const supabase = createClient()

    const handleDelete = async (
      payload: RealtimePostgresDeletePayload<Message>,
    ) => {
      const deletedId = payload.old.id as string

      setMessages((prev) => prev.filter((msg) => msg.id !== deletedId))

      // if the lastMessages contains a message matching the deltedId, remove it
      setLastMessages((prev) => {
        const newState = { ...prev }
        Object.values(newState).forEach((msg) => {
          if (msg?.id === deletedId) {
            delete newState[msg.sender_id]
          }
        })

        return newState
      })

      // find the next lastMessage from that user and add it to lastMessages
      // NOTE: This query is intentionally broad. DELETE payloads do not include sender/receiver info due to RLS. Rebuild from authoritative snapshot
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })

      if (!messages) return

      const map: Record<string, Message> = {}
      for (const msg of messages) {
        const partnerId = getPartnerId(msg, currentUser.id)
        if (!map[partnerId]) map[partnerId] = msg
      }

      setLastMessages(map)
    }

    const channel = supabase
      .channel('messages-deletes')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        handleDelete,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  useEffect(() => {
    if (isTyping) scrollToBottom()
  }, [isTyping, scrollToBottom])

  if (!currentUser) return <DashboardSkeleton />

  return (
    <div className='h-[calc(100vh-1rem)] rounded-xl flex'>
      <ConversationsPanel
        filteredProfiles={filteredProfiles}
        profilesLoading={profilesLoading}
        lastMessages={lastMessages}
        lastMessagesLoading={lastMessagesLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedProfile={selectedProfile}
        setSelectedProfileId={setSelectedProfileId}
        onNewMessage={() => setIsProfileSelectDialogOpen(true)}
        selectedProfileId={selectedProfileId}
        setIsProfileSelectDialogOpen={setIsProfileSelectDialogOpen}
      />

      <ChatPanel
        selectedProfile={selectedProfile}
        messages={messages}
        messagesLoading={messagesLoading}
        message={message}
        isMobileView={isMobileView}
        messagesEndRef={messagesEndRef}
        handleDeleteMessage={handleDeleteMessage}
        handleEditMessage={handleEditMessage}
        handleMessageChange={handleMessageChange}
        handleSubmitMessage={handleSubmitMessage}
        isTyping={isTyping}
        setIsProfileSelectDialogOpen={setIsProfileSelectDialogOpen}
        setSelectedProfileId={setSelectedProfileId}
      />

      <ConversationSelectDialog
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        profilesLoading={profilesLoading}
        filteredProfiles={filteredProfiles}
        setSelectedProfileId={setSelectedProfileId}
        isProfileSelectDialogOpen={isProfileSelectDialogOpen}
        setIsProfileSelectDialogOpen={setIsProfileSelectDialogOpen}
        lastMessages={lastMessages}
        lastMessagesLoading={lastMessagesLoading}
        selectedProfile={selectedProfile}
      />
    </div>
  )
}

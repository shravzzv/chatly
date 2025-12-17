'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Paperclip,
  MessagesSquare,
  FilePen,
  AudioLines,
  ImagePlus,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import { ButtonGroup } from '@/components/ui/button-group'
import { MessageBubble } from '@/components/message-bubble'
import { toast } from 'sonner'
import { Message } from '@/types/message'
import { Profile } from '@/types/profile'
import { createClient } from '@/utils/supabase/client'
import type {
  RealtimePostgresChangesPayload,
  RealtimePostgresDeletePayload,
} from '@supabase/supabase-js'
import { Skeleton } from '@/components/ui/skeleton'
import { v4 as uuidv4 } from 'uuid'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCheckoutUrl } from '@/lib/get-checkout-url'
import { Billing, Plan } from '@/types/subscription'
import { useUser } from '@/hooks/use-user'
import {
  formatDateHeader,
  getDisplayName,
  groupMessagesByDate,
} from '@/lib/dashboard'
import DashboardSkeleton from '@/components/dashboard-skeleton'
import UserAvatar from '@/components/user-avatar'
import ProfileSelectDialog from '@/components/profile-select-dialog'
import ProfileAvatar from '@/components/profile-avatar'

export default function Page() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profilesLoading, setProfilesLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isProfileSelectDialogOpen, setIsProfileSelectDialogOpen] =
    useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false)
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)
  const [lastMessagesLoading, setLastMessagesLoading] = useState<boolean>(true)
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingState>>(
    {}
  )
  const [lastMessages, setLastMessages] = useState<
    Record<string, Message | null>
  >({})

  const isMobileView = useIsMobile()
  const { user: currentUser, loading: currentUserLoading, error } = useUser()

  const router = useRouter()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const selectedUserId = searchParams.get('selectedUserId')
  const plan = searchParams.get('plan')
  const billing = searchParams.get('billing')
  const selectedProfileId = searchParams.get('selectedProfileId')

  const filteredProfiles = searchQuery
    ? profiles.filter((p) => {
        const name = p.name?.toLowerCase() || ''
        const username = p.username?.toLowerCase() || ''
        return name.includes(searchQuery) || username.includes(searchQuery)
      })
    : profiles
  // searchQuery is always lowercase because it's being enforced wherever setSearchQuery is being used

  const isSelectedUserTyping =
    selectedProfile &&
    typingUsers[selectedProfile.user_id]?.typing_to === currentUser?.id

  // Fetch all profiles ✅
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

  // Fetch messages when selectedProfile changes ✅
  useEffect(() => {
    if (!selectedProfile || !currentUser) return
    const supabase = createClient()

    const fetchMessages = async () => {
      setMessagesLoading(true)

      // Fetch messages where the logged-in user and the selected user are participants — meaning one is the sender and the other is the receiver.
      const condition = [
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedProfile.user_id})`,
        `and(sender_id.eq.${selectedProfile.user_id},receiver_id.eq.${currentUser.id})`,
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
  }, [selectedProfile, currentUser])

  // Allow profiles to focus on the search input using "ctrl + f" ✅
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fetch last messages for all users
  useEffect(() => {
    if (!currentUser) return
    const supabase = createClient()
    const lastMap: Record<string, Message> = {}

    const fetchLastMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching last messages:', error)
        setLastMessagesLoading(false)
        return
      }

      for (const msg of data) {
        // Determine who the other participant is in this message.
        // Since messages are sorted newest → oldest, the first message we find
        // for each user is already their latest one.
        // So we only store it once as that user's "last message".
        const otherId =
          msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id
        if (!lastMap[otherId]) lastMap[otherId] = msg
      }

      setLastMessages(lastMap)
      setLastMessagesLoading(false)
    }

    fetchLastMessages()
  }, [currentUser])

  // Enable real-time subscription for messages
  useEffect(() => {
    if (!selectedProfile || !currentUser) return
    const supabase = createClient()

    function handlePayload(payload: RealtimePostgresChangesPayload<Message>) {
      if (!selectedProfile || !currentUser) return
      const msg = (payload.new as Message) || (payload.old as Message)

      // Determine the ID of the other participant for lastMessages update
      const otherId =
        msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id

      // Guard: Only process if the event involves the currently selected chat OR
      // if it's an INSERT/UPDATE that affects the sidebar preview.
      // Since we are filtering on receiver_id, this check is mostly about
      // whether the message belongs to the currently open chat.
      const isCurrentChat = selectedProfile.user_id === otherId

      switch (payload.eventType) {
        case 'INSERT': {
          const newMsg = payload.new as Message

          if (isCurrentChat) {
            // 1. Update main messages array (only if chat is open)
            setMessages((prev) => [...prev, newMsg])
            setTimeout(scrollToBottom, 100)
          }

          // 2. Update lastMessages state for the sidebar
          setLastMessages((prev) => ({
            ...prev,
            [otherId]: newMsg, // The new message is now the last message
          }))
          break
        }

        case 'UPDATE': {
          const updatedMsg = payload.new as Message

          if (isCurrentChat) {
            // 1. Update main messages array
            setMessages((prev) =>
              prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
            )
          }

          // 2. Update lastMessages state for the sidebar
          setLastMessages((prevLast) => {
            // Only update the lastMessages preview if the updated message
            // is the one currently displayed in the sidebar preview.
            if (prevLast[otherId]?.id === updatedMsg.id) {
              return {
                ...prevLast,
                [otherId]: updatedMsg,
              }
            }
            return prevLast // Otherwise, keep the old last message
          })
          break
        }

        default: {
          break
        }
      }
    }

    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const deletedId = payload.old.id as string

          // Find the deleted message object in the current state *before* filtering it out.
          const deletedMessage = messages.find((msg) => msg.id === deletedId)

          if (deletedMessage) {
            const otherId =
              deletedMessage.sender_id === currentUser.id
                ? deletedMessage.receiver_id
                : deletedMessage.sender_id

            // 1. Update messages state (removes it from the open chat view)
            setMessages((prev) => prev.filter((msg) => msg.id !== deletedId))

            // 2. Update the lastMessages state for the sidebar
            setLastMessages((prevLast) => {
              const updated = { ...prevLast }

              // Re-calculate the remaining messages in this *conversation*
              const remainingMessages = messages
                .filter(
                  (msg) =>
                    msg.id !== deletedId && // Exclude the deleted message
                    ((msg.sender_id === currentUser.id &&
                      msg.receiver_id === otherId) ||
                      (msg.sender_id === otherId &&
                        msg.receiver_id === currentUser.id))
                )
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )

              const newLastMessage = remainingMessages[0] || null

              if (newLastMessage) {
                updated[otherId] = newLastMessage
              } else {
                delete updated[otherId]
              }
              return updated
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          // Listen to all INSERT/UPDATE events where I am the receiver
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          handlePayload(payload as RealtimePostgresChangesPayload<Message>)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedProfile, currentUser, messages])

  // Show typing status
  useEffect(() => {
    if (!currentUser) return
    const supabase = createClient()

    const channel = supabase.channel('typing-presence', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<TypingState>()
        const typingMap: Record<string, TypingState> = {}

        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            if (presence.typing_to === currentUser.id) {
              typingMap[presence.user_id] = presence
            }
          })
        })

        setTypingUsers(typingMap)
        setTimeout(scrollToBottom, 100)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            typing_to: '',
            timestamp: Date.now(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  // Handle selectedProfileId query parameter ✅
  useEffect(() => {
    if (selectedProfileId && profiles.length > 0 && !selectedProfile) {
      const userFromParam = profiles.find(
        (profile) => profile.user_id === selectedProfileId
      )
      if (userFromParam) setSelectedProfile(userFromParam)
    }
  }, [selectedProfileId, profiles, selectedProfile])

  // Navigate the user to the checkout page when they've signed up through the pricing page to ensure continuity ✅
  useEffect(() => {
    if (!currentUser || !plan || !billing) return

    const checkoutUrl = getCheckoutUrl(
      plan as Plan,
      billing as Billing,
      currentUser
    )

    if (checkoutUrl) router.replace(checkoutUrl)
  }, [currentUser, plan, billing, router])

  const handleSubmit = async () => {
    if (!message.trim() || !selectedProfile || !currentUser) return
    updateTypingStatus(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    const supabase = createClient()
    const tempId = uuidv4()
    const now = new Date().toISOString()

    const newMessage: Message = {
      id: tempId,
      text: message,
      sender_id: currentUser.id,
      receiver_id: selectedProfile.user_id,
      created_at: now,
      updated_at: now,
    }

    // Optimistic UI update
    setMessages((prev) => [...prev, newMessage])
    setMessage('')
    setTimeout(scrollToBottom, 100)

    // Update last message preview
    setLastMessages((prev) => ({
      ...prev,
      [selectedProfile.user_id]: newMessage,
    }))

    // Send to Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          text: message,
          sender_id: currentUser.id,
          receiver_id: selectedProfile.user_id,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single()

    if (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
      setLastMessages((prev) => {
        const updated = { ...prev }
        delete updated[selectedProfile.user_id]
        return updated
      })
      toast.error('Failed to send message')
      return
    }

    // Replace temp message with real DB message
    setMessages((prev) => prev.map((msg) => (msg.id === tempId ? data : msg)))
    setLastMessages((prev) => ({
      ...prev,
      [selectedProfile.user_id]: data,
    }))
  }

  const handleDeleteMessage = async (id: string) => {
    if (!currentUser) return
    const prevMessages = messages
    setMessages((prev) => prev.filter((msg) => msg.id !== id))

    const supabase = createClient()
    const { error } = await supabase.from('messages').delete().eq('id', id)

    if (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
      setMessages(prevMessages)
      return
    }

    // Check if deleted message was the last one for this chat
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
              (msg.sender_id === otherId && msg.receiver_id === currentUser.id))
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
          : msg
      )
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
      console.error('Error updating message:', error)
      toast.error('Failed to update message')
      setMessages(prevMessages)
      return
    }

    toast.success('Message updated')
  }

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!currentUser || !selectedProfile) return
    const supabase = createClient()
    const channel = supabase.channel('typing-presence')

    await channel.track({
      user_id: currentUser.id,
      typing_to: isTyping ? selectedProfile.user_id : '',
      timestamp: Date.now(),
    })
  }

  if (currentUserLoading || !currentUser) return <DashboardSkeleton />

  return (
    <div className='flex h-full bg-background text-foreground rounded-2xl max-h-[calc(100vh-1rem)]'>
      <div
        className={`flex flex-col h-full p-2 w-full md:w-80 shrink-0 border-r ${
          selectedProfile && isMobileView ? 'hidden' : 'flex'
        }`}
      >
        <div className='flex items-center justify-between p-4'>
          <h2 className='text-xl font-semibold flex items-center gap-4'>
            Inbox <MessagesSquare />
          </h2>

          <Button
            variant='outline'
            size='icon-sm'
            className='cursor-pointer'
            onClick={() => setIsProfileSelectDialogOpen(true)}
          >
            <FilePen className='w-5 h-5' />
          </Button>
        </div>

        <div className='px-3 pb-4 border-b'>
          <InputGroup>
            <InputGroupInput
              type='text'
              placeholder='Type to search...'
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
            <InputGroupAddon>
              <Search className='w-4 h-4' />
            </InputGroupAddon>
            {!isMobileView && (
              <InputGroupAddon align='inline-end'>
                <Kbd>⌘</Kbd>
                <Kbd>F</Kbd>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>

        <ScrollArea className='h-full rounded-md px-2 flex-1 overflow-y-scroll [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
          {profilesLoading ? (
            // Skeleton UI
            <div className='space-y-3 px-2 py-4'>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className='flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-muted/40 transition'
                >
                  <Skeleton className='h-10 w-10 rounded-full shrink-0' />
                  <div className='flex flex-col gap-2 flex-1'>
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-3 w-1/2' />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            // Empty state when no profiles match search
            <div className='flex flex-col items-center justify-center h-full text-center p-4'>
              <p className='text-muted-foreground'>
                {searchQuery ? 'No profiles found' : 'No profiles available'}
              </p>
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <Button
                key={profile.id}
                onClick={() => setSelectedProfile(profile)}
                variant='ghost'
                size='lg'
                className={`
                    w-full justify-start gap-3 px-4 py-8 rounded-xl hover:bg-muted transition text-left cursor-pointer ${
                      selectedProfile?.id === profile.id ? 'bg-muted' : ''
                    }`}
              >
                <ProfileAvatar profile={profile} />

                <div className='flex flex-col text-left overflow-hidden'>
                  <span className='font-medium truncate'>
                    {getDisplayName(profile)}
                    {profile.user_id === currentUser.id && ' (You)'}
                  </span>
                  <span className='text-xs text-muted-foreground truncate'>
                    {lastMessagesLoading ? (
                      <Skeleton className='h-4 w-24 rounded-md' />
                    ) : lastMessages[profile.user_id] ? (
                      `${
                        lastMessages[profile.user_id]?.sender_id ===
                        currentUser.id
                          ? 'You: '
                          : ''
                      }${lastMessages[profile.user_id]?.text}`
                    ) : (
                      'No messages yet'
                    )}
                  </span>
                </div>
              </Button>
            ))
          )}
        </ScrollArea>
      </div>

      <div
        className={`flex flex-col flex-1 h-full min-w-0 ${
          !selectedProfile && isMobileView ? 'hidden' : 'flex'
        }`}
      >
        {selectedProfile ? (
          <>
            <div className='flex items-center justify-between p-4 border-b'>
              <div className='flex items-center gap-3'>
                {isMobileView && (
                  <button onClick={() => setSelectedProfile(null)}>
                    <ArrowLeft className='w-5 h-5' />
                  </button>
                )}

                <ProfileAvatar profile={selectedProfile} />

                <div>
                  <p className='font-semibold'>
                    {getDisplayName(selectedProfile)}
                    {selectedProfile.user_id === currentUser.id && ' (You)'}
                  </p>
                  {selectedProfile.username && (
                    <p className='text-xs text-muted-foreground truncate'>
                      @{selectedProfile.username}
                    </p>
                  )}
                </div>
              </div>

              <ButtonGroup>
                <Button
                  variant='outline'
                  size='icon-lg'
                  className='cursor-pointer'
                >
                  <Phone className='w-5 h-5 cursor-pointer' />
                </Button>

                <Button
                  variant='outline'
                  size='icon-lg'
                  className='cursor-pointer'
                >
                  <Video className='w-5 h-5 cursor-pointer' />
                </Button>

                <Button
                  variant='outline'
                  size='icon-lg'
                  className='cursor-pointer'
                >
                  <MoreVertical className='w-5 h-5 cursor-pointer' />
                </Button>
              </ButtonGroup>
            </div>

            <div className='flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
              {messagesLoading ? (
                <div className='space-y-4'>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        i % 3 === 0 ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className='space-y-2'>
                        <Skeleton className='h-16 w-[250px] rounded-2xl' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className='flex items-center justify-center h-full'>
                  <p className='text-muted-foreground'>
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                <>
                  {groupMessagesByDate(messages).map((group) => (
                    <div key={group.date}>
                      <div className='flex items-center justify-center my-4'>
                        <Badge>{formatDateHeader(new Date(group.date))}</Badge>
                      </div>

                      <div className='space-y-4'>
                        {group.messages.map((msg) => (
                          <MessageBubble
                            key={msg.id}
                            {...msg}
                            currentUserId={currentUser.id}
                            onDelete={() => handleDeleteMessage(msg.id)}
                            onEdit={(updatedText) =>
                              handleEditMessage(msg.id, updatedText)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
              {isSelectedUserTyping && (
                <div className='flex justify-start'>
                  <div className='bg-muted rounded-2xl px-4 py-3 flex items-center gap-2'>
                    <div className='flex gap-1'>
                      <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]' />
                      <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]' />
                      <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce' />
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      typing...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className='p-2'>
              <InputGroup className='flex items-end'>
                <InputGroupAddon>
                  <InputGroupButton
                    variant='ghost'
                    size='icon-sm'
                    className='cursor-pointer'
                  >
                    <ImagePlus className='w-5 h-5 text-muted-foreground' />
                  </InputGroupButton>
                  <InputGroupButton
                    variant='ghost'
                    size='icon-sm'
                    className='cursor-pointer'
                  >
                    <Paperclip className='w-5 h-5 text-muted-foreground' />
                  </InputGroupButton>
                  <InputGroupButton
                    variant='ghost'
                    size='icon-sm'
                    className='cursor-pointer'
                  >
                    <AudioLines className='w-5 h-5 text-muted-foreground' />
                  </InputGroupButton>
                </InputGroupAddon>

                <InputGroupTextarea
                  placeholder='Type a message...'
                  value={message}
                  className='min-h-10 max-h-[200px] resize-none overflow-y-auto bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0 outline-none border-0 pt-2.5'
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isMobileView) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                />

                <InputGroupAddon align='inline-end'>
                  <InputGroupButton
                    onClick={handleSubmit}
                    variant='default'
                    size='icon-sm'
                    className='cursor-pointer'
                  >
                    <Send className='w-4 h-4' />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center gap-4 text-muted-foreground h-full'>
            <FilePen />
            <p>Select a chat to start messaging</p>
            <Button
              className='cursor-pointer'
              onClick={() => setIsProfileSelectDialogOpen(true)}
            >
              Send Message
            </Button>
          </div>
        )}
      </div>

      <ProfileSelectDialog
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        profilesLoading={profilesLoading}
        filteredProfiles={filteredProfiles}
        setSelectedProfile={setSelectedProfile}
        isProfileSelectDialogOpen={isProfileSelectDialogOpen}
        setIsProfileSelectDialogOpen={setIsProfileSelectDialogOpen}
      />
    </div>
  )
}

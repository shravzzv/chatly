'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { useRouter, useSearchParams } from 'next/navigation'
import { getCheckoutUrl } from '@/lib/get-checkout-url'
import { Billing, Plan } from '@/types/subscription'
import { useUser } from '@/hooks/use-user'
import {
  formatDateHeader,
  getDisplayName,
  getPartnerId,
  groupMessagesByDate,
} from '@/lib/dashboard'
import DashboardSkeleton from '@/components/dashboard-skeleton'
import ProfileSelectDialog from '@/components/profile-select-dialog'
import ProfileAvatar from '@/components/profile-avatar'
import TypingIndicator from '@/components/typing-indicator'
import { useTypingIndicator } from '@/hooks/use-typing-indicator'
import { SidebarTrigger } from '@/components/sidebar-trigger'

export default function Page() {
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
    () => searchParams.get('senderId')
  )

  const [isProfileSelectDialogOpen, setIsProfileSelectDialogOpen] =
    useState(false)
  const [lastMessages, setLastMessages] = useState<
    Record<string, Message | null>
  >({})

  // memoized variables
  const selectedProfile = useMemo(
    () => profiles.find((p) => p.user_id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  )
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  // Memoized so it can be safely used in effect dependencies without causing re-runs

  // state variables from custom hooks
  const isMobileView = useIsMobile()
  const {
    user: currentUser,
    loading: currentUserLoading,
    error: currentUserError,
  } = useUser()
  const { isTyping, updateTypingStatus } = useTypingIndicator(selectedProfileId)

  // refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // derived variables
  const router = useRouter()
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
      setMessages(prevMessages)
      toast.error('Failed to update message')
      console.error('Error updating message:', error)
      return
    }

    toast.success('Message updated')
  }

  // effects

  // Show error toast if fetching the user returns an auth error
  useEffect(() => {
    if (currentUserError) {
      toast.error('Could not authenticate. Please log in again.')
      console.error('AuthError in the dashboard', currentUserError)
    }
  }, [currentUserError])

  // Navigate the user to the checkout page when they've signed up through the pricing page to ensure continuity
  useEffect(() => {
    if (!currentUser || !plan || !billing) return

    const checkoutUrl = getCheckoutUrl(
      plan as Plan,
      billing as Billing,
      currentUser
    )

    if (checkoutUrl) router.replace(checkoutUrl)
  }, [currentUser, plan, billing, router])

  // Allow profiles to focus on the search input using "ctrl + f"
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
      payload: RealtimePostgresChangesPayload<Message>
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
              prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
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
        handlePayload
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
      payload: RealtimePostgresDeletePayload<Message>
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
        handleDelete
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  useEffect(() => {
    if (isTyping) scrollToBottom()
  }, [isTyping, scrollToBottom])

  if (currentUserLoading || !currentUser) return <DashboardSkeleton />

  // you could add further checks, and render the components of the dashboard conditionally here instead of using ?: within one big block. This needs you to modularize the components first though.

  // if(!selectedProfile) return (
  // <>
  //   <ProfilesSidebar/>
  //   <EmptyMessageTab/>
  // </>
  // )
  // something like this

  return (
    <div className='h-[calc(100vh-1rem)] rounded-xl flex bg-background text-foreground'>
      {/* profiles sidebar tab */}
      <div
        className={`flex flex-col h-full p-2 w-full md:w-80 shrink-0 border-r rounded-xl bg-blue-200 ${
          selectedProfile ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* heading */}
        <div className='flex items-center justify-between p-4'>
          <SidebarTrigger />

          <h2 className='text-xl font-semibold flex items-center gap-4'>
            Inbox
            <MessagesSquare />
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

        {/* search input box */}
        <div className='px-3 pb-4 border-b'>
          <InputGroup>
            <InputGroupInput
              type='text'
              placeholder='name or username...'
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

        {/* profiles scroll area */}
        <ScrollArea className='flex-1 overflow-y-auto rounded-xl px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-amber-200 flex flex-col'>
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
            <div className='flex flex-col items-center justify-center h-full text-center p-4'>
              <p className='text-muted-foreground'>
                {searchQuery ? 'No profiles found' : 'No profiles available'}
              </p>
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <Button
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.user_id)}
                variant='ghost'
                size='lg'
                className={`
                    w-full justify-start gap-3 px-4 py-8 rounded-xl hover:bg-muted transition text-left cursor-pointer ${
                      selectedProfile?.id === profile.id ? 'bg-muted' : ''
                    }`}
              >
                <ProfileAvatar profile={profile} />

                <div className='flex flex-col text-left overflow-hidden min-w-0'>
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

      {/* chat box tab */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 rounded-xl bg-violet-200 ${
          selectedProfile ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedProfile ? (
          <>
            <div className='flex items-center justify-between p-4 border-b'>
              <div className='flex items-center gap-3'>
                {isMobileView && (
                  <button onClick={() => setSelectedProfileId(null)}>
                    <ArrowLeft className='w-5 h-5' />
                  </button>
                )}

                <ProfileAvatar profile={selectedProfile} />

                <div>
                  <p className='font-semibold truncate'>
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

            {/* chat window */}
            <ScrollArea
              className='flex-1 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
              data-testid='message-list'
            >
              {messagesLoading ? (
                // show messages tab skeleton
                <div className='space-y-4'>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        i % 3 === 0 ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className='space-y-2'>
                        <Skeleton className='h-16 w-62.5 rounded-2xl' />
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

              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* chat input */}
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
                  className='min-h-10 max-h-50 resize-none overflow-y-auto bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0 outline-none border-0 pt-2.5'
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isMobileView) {
                      e.preventDefault()
                      handleSubmitMessage()
                    }
                  }}
                  // ? why not use onSubmit?
                />

                <InputGroupAddon align='inline-end'>
                  <InputGroupButton
                    aria-label='Send message'
                    onClick={handleSubmitMessage}
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
        setSelectedProfileId={setSelectedProfileId}
        isProfileSelectDialogOpen={isProfileSelectDialogOpen}
        setIsProfileSelectDialogOpen={setIsProfileSelectDialogOpen}
      />
    </div>
  )
}

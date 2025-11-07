'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
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
  User as SupabaseUser,
} from '@supabase/supabase-js'
import { Skeleton } from '@/components/ui/skeleton'
import defaultAvatar from '@/public/default-avatar.jpg'
import { v4 as uuidv4 } from 'uuid'

export default function Page() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [profilesLoading, setProfilesLoading] = useState<boolean>(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)
  const [currentUserLoading, setCurrentUserLoading] = useState<boolean>(true)
  const [lastMessages, setLastMessages] = useState<
    Record<string, Message | null>
  >({})
  const [lastMessagesLoading, setLastMessagesLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMobileView = useIsMobile()

  // Fetch current authenticated user
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user)
      setCurrentUserLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch all profiles
  useEffect(() => {
    const supabase = createClient()

    const fetchUsers = async () => {
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

    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (!selectedUser || !currentUser) return
    const supabase = createClient()

    const fetchMessages = async () => {
      setMessagesLoading(true)
      const condition = [
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id})`,
        `and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`,
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
  }, [selectedUser, currentUser])

  // Enable real-time subscription for messages
  useEffect(() => {
    if (!selectedUser || !currentUser) return
    const supabase = createClient()

    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          // Listen to all messages involving current user
          filter: `sender_id=eq.${currentUser.id}`,
        },
        (payload) => {
          // Only process if it's related to the selected conversation
          const msg = payload.new as Message
          if (
            (payload.eventType === 'INSERT' ||
              payload.eventType === 'UPDATE') &&
            (msg.receiver_id === selectedUser.id ||
              msg.sender_id === selectedUser.id)
          ) {
            handlePayload(payload as RealtimePostgresChangesPayload<Message>)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          // Listen to messages where current user is receiver
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const msg = (payload.new as Message) || (payload.old as Message)
          if (
            msg.sender_id === selectedUser.id ||
            msg.receiver_id === selectedUser.id
          ) {
            handlePayload(payload as RealtimePostgresChangesPayload<Message>)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
        }
      )
      .subscribe()

    function handlePayload(payload: RealtimePostgresChangesPayload<Message>) {
      switch (payload.eventType) {
        case 'INSERT': {
          const newMsg = payload.new as Message
          if (currentUser) {
            if (newMsg.sender_id === currentUser.id) return
          }
          setMessages((prev) => [...prev, newMsg])
          setTimeout(scrollToBottom, 100)
          break
        }

        case 'UPDATE': {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          )
          break
        }

        default: {
          console.warn('Unhandled realtime event type:', payload)
          break
        }
      }
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedUser, currentUser])

  // Allow profiles to focus on the search input using ctrl + f
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

      const lastMap: Record<string, Message> = {}
      for (const msg of data) {
        const otherId =
          msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id
        if (!lastMap[otherId]) lastMap[otherId] = msg
      }
      setLastMessages(lastMap)
      setLastMessagesLoading(false)
    }

    fetchLastMessages()
  }, [currentUser])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!message.trim() || !selectedUser || !currentUser) return
    const supabase = createClient()
    const tempId = uuidv4()
    const now = new Date().toISOString()

    const newMessage: Message = {
      id: tempId,
      text: message,
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
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
      [selectedUser.id]: newMessage,
    }))

    // Send to Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          text: message,
          sender_id: currentUser.id,
          receiver_id: selectedUser.id,
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
        delete updated[selectedUser.id]
        return updated
      })
      toast.error('Failed to send message')
      return
    }

    // Replace temp message with real DB message
    setMessages((prev) => prev.map((msg) => (msg.id === tempId ? data : msg)))
    setLastMessages((prev) => ({
      ...prev,
      [selectedUser.id]: data,
    }))
  }

  const handleDeleteMessage = async (id: string) => {
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

  const filteredProfiles: Profile[] = profiles.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (currentUserLoading || !currentUser) {
    return (
      <div className='flex h-full bg-background text-foreground rounded-2xl'>
        {/* Sidebar skeleton */}
        <div className='flex flex-col h-full p-2 w-full md:w-80 shrink-0 border-r'>
          <div className='flex items-center justify-between p-4'>
            <Skeleton className='h-6 w-32 rounded-md' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </div>

          <div className='px-3 pb-4 border-b'>
            <Skeleton className='h-10 w-full rounded-md' />
          </div>

          <div className='p-4 space-y-4 overflow-y-hidden'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <Skeleton className='w-10 h-10 rounded-full' />
                <div className='flex flex-col gap-2 flex-1'>
                  <Skeleton className='h-4 w-3/4 rounded-md' />
                  <Skeleton className='h-3 w-1/2 rounded-md' />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area skeleton */}
        <div className='flex flex-col flex-1 h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b'>
            <div className='flex items-center gap-3'>
              <Skeleton className='w-8 h-8 rounded-full' />
              <Skeleton className='h-5 w-32 rounded-md' />
            </div>
            <div className='flex gap-2'>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className='h-8 w-8 rounded-md' />
              ))}
            </div>
          </div>

          {/* Message bubbles */}
          <div className='flex-1 p-4 space-y-4 overflow-y-hidden'>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                <Skeleton
                  className={`h-16 w-1/2 rounded-2xl ${
                    i % 2 === 0 ? 'bg-muted' : 'bg-primary/20'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className='p-2 border-t'>
            <div className='flex items-end gap-2'>
              <div className='flex gap-2'>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className='h-8 w-8 rounded-md' />
                ))}
              </div>
              <Skeleton className='flex-1 h-10 rounded-md' />
              <Skeleton className='h-8 w-8 rounded-md' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full bg-background text-foreground rounded-2xl'>
      <div
        className={`flex flex-col h-full p-2 w-full md:w-80 shrink-0 border-r ${
          selectedUser && isMobileView ? 'hidden' : 'flex'
        }`}
      >
        <div className='flex items-center justify-between p-4'>
          <h2 className='text-xl font-semibold flex items-center gap-4'>
            Inbox <MessagesSquare />
          </h2>

          <Button variant='outline' size='icon-sm' className='cursor-pointer'>
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  {/* Avatar */}
                  <Skeleton className='h-10 w-10 rounded-full shrink-0' />

                  {/* Name + last message */}
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
                onClick={() => setSelectedUser(profile)}
                variant='ghost'
                size='lg'
                className={`
          w-full justify-start gap-3 px-4 py-8 rounded-xl hover:bg-muted transition text-left cursor-pointer ${
            selectedUser?.id === profile.id ? 'bg-muted' : ''
          }`}
              >
                <Image
                  src={profile.avatar_url || defaultAvatar}
                  alt={profile.name}
                  className='w-10 h-10 rounded-full object-cover'
                  width={40}
                  height={40}
                />

                <div className='flex flex-col text-left overflow-hidden'>
                  <span className='font-medium truncate'>
                    {profile.name || profile.email?.split('@')[0] || 'User'}
                    {profile.id === currentUser.id && ' (You)'}
                  </span>
                  <span className='text-xs text-muted-foreground truncate'>
                    {lastMessagesLoading ? (
                      <Skeleton className='h-4 w-24 rounded-md' />
                    ) : lastMessages[profile.id] ? (
                      `${
                        lastMessages[profile.id]?.sender_id === currentUser.id
                          ? 'You: '
                          : ''
                      }${lastMessages[profile.id]?.text}`
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
          !selectedUser && isMobileView ? 'hidden' : 'flex'
        }`}
      >
        {selectedUser ? (
          <>
            <div className='flex items-center justify-between p-4 border-b'>
              <div className='flex items-center gap-3'>
                {isMobileView && (
                  <button onClick={() => setSelectedUser(null)}>
                    <ArrowLeft className='w-5 h-5' />
                  </button>
                )}

                <Image
                  src={selectedUser.avatar_url || defaultAvatar}
                  alt={selectedUser.name}
                  className='w-8 h-8 rounded-full object-cover'
                  width={32}
                  height={32}
                />

                <span className='font-semibold'>
                  {selectedUser.name ||
                    selectedUser.email?.split('@')[0] ||
                    'User'}
                  {selectedUser.id === currentUser.id && ' (You)'}
                </span>
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
                // Message skeletons
                <div className='space-y-4'>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        i % 3 === 0 ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          i % 3 === 0 ? 'bg-primary/20' : 'bg-muted'
                        }`}
                      >
                        <div className='h-4 bg-muted-foreground/20 rounded animate-pulse w-48 mb-2' />
                        <div className='h-4 bg-muted-foreground/20 rounded animate-pulse w-32' />
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
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    {...msg}
                    currentUserId={currentUser.id}
                    onDelete={() => handleDeleteMessage(msg.id)}
                    onEdit={(updatedText) =>
                      handleEditMessage(msg.id, updatedText)
                    }
                  />
                ))
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
                  onChange={(e) => setMessage(e.target.value)}
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
            <Button className='cursor-pointer'>Send Message</Button>
          </div>
        )}
      </div>
    </div>
  )
}

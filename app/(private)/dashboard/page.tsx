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
import Image, { StaticImageData } from 'next/image'
import heroImage from '@/public/landing-hero.jpg'
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

interface User {
  id: string
  name: string
  avatar: string | StaticImageData
}

interface Message {
  id: string
  senderId: string
  text: string
  time: string
}

const fakeUsers: User[] = [
  { id: '1', name: 'Alice Johnson', avatar: heroImage },
  { id: '2', name: 'Bob Smith', avatar: heroImage },
  { id: '3', name: 'Charlie Davis', avatar: heroImage },
  { id: '4', name: 'Diana Prince', avatar: heroImage },
  { id: '5', name: 'Ethan Hunt', avatar: heroImage },
]

const fakeMessages: Message[] = [
  { id: '1', senderId: '1', text: 'Hey there 👋', time: '09:42 AM' },
  {
    id: '2',
    senderId: 'me',
    text: 'Hey Alice! How are you?',
    time: '09:43 AM',
  },
  { id: '3', senderId: '1', text: 'All good, thanks!', time: '09:44 AM' },
  {
    id: '4',
    senderId: '1',
    text: 'Just finished the layout fixes. It looks much better now!',
    time: '09:45 AM',
  },
  {
    id: '5',
    senderId: 'me',
    text: 'Awesome! That was fast. The scrolling issue was driving me crazy.',
    time: '09:46 AM',
  },
  {
    id: '6',
    senderId: '1',
    text: "It's all about setting the container heights correctly in the flex hierarchy. We just needed to ensure the main chat area fills the viewport.",
    time: '09:47 AM',
  },
  {
    id: '7',
    senderId: 'me',
    text: 'Got it. Height inheritance is key.',
    time: '09:48 AM',
  },
]

export default function Page() {
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>(fakeUsers)
  const [messages, setMessages] = useState<Message[]>(fakeMessages)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMobileView = useIsMobile()

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  useEffect(() => {
    if (selectedUser) {
      setTimeout(scrollToBottom, 100)
    }
  }, [selectedUser])

  const handleSubmit = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: message,
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages([...messages, newMessage])
    setMessage('')
    setTimeout(scrollToBottom, 100)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
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
          {filteredUsers.map((user) => (
            <Button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              variant='ghost'
              size='lg'
              className={`
                  w-full justify-start gap-3 px-4 py-8 rounded-xl hover:bg-muted transition text-left cursor-pointer ${
                    selectedUser?.id === user.id ? 'bg-muted' : ''
                  }`}
            >
              <Image
                src={user.avatar}
                alt={user.name}
                className='w-10 h-10 rounded-full object-cover'
                width={40}
                height={40}
              />

              <div className='flex flex-col text-left overflow-hidden'>
                <span className='font-medium truncate'>{user.name}</span>
                <span className='text-xs text-muted-foreground truncate'>
                  Last message preview...
                </span>
              </div>
            </Button>
          ))}
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
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className='w-8 h-8 rounded-full object-cover'
                  width={32}
                  height={32}
                />

                <span className='font-semibold'>{selectedUser.name}</span>
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
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  id={msg.id}
                  text={msg.text}
                  time={msg.time}
                  senderId={msg.senderId}
                  onDelete={() => handleDeleteMessage(msg.id)}
                />
              ))}

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

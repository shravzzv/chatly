'use client'

import { useState } from 'react'
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

const users: User[] = [
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const isMobileView = useIsMobile()

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
          <div className='flex items-center gap-2 bg-muted px-3 py-2 rounded-lg'>
            <Search className='w-4 h-4' />
            <input
              type='text'
              placeholder='Search users...'
              className='bg-transparent outline-none w-full text-sm'
            />
          </div>
        </div>

        <ScrollArea className='h-full rounded-md px-2 flex-1 overflow-y-scroll [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
          {users.map((user) => (
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

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='icon-sm'
                  className='cursor-pointer'
                >
                  <Phone className='w-5 h-5 cursor-pointer' />
                </Button>

                <Button
                  variant='outline'
                  size='icon-sm'
                  className='cursor-pointer'
                >
                  <Video className='w-5 h-5 cursor-pointer' />
                </Button>

                <Button
                  variant='outline'
                  size='icon-sm'
                  className='cursor-pointer'
                >
                  <MoreVertical className='w-5 h-5 cursor-pointer' />
                </Button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
              {fakeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === 'me' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl max-w-xs text-sm ${
                      msg.senderId === 'me'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className='block text-[10px] text-muted-foreground text-right mt-1'>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className='p-2 flex items-center gap-2 border-t'>
              <Button
                variant='outline'
                size='icon-sm'
                className='shrink-0 cursor-pointer'
              >
                <ImagePlus className='w-5 h-5 text-muted-foreground' />
              </Button>

              <Button
                variant='outline'
                size='icon-sm'
                className='shrink-0 cursor-pointer'
              >
                <Paperclip className='w-5 h-5 text-muted-foreground' />
              </Button>

              <Button
                variant='outline'
                size='icon-sm'
                className='shrink-0 cursor-pointer'
              >
                <AudioLines className='w-5 h-5 text-muted-foreground' />
              </Button>

              <input
                type='text'
                placeholder='Type a message...'
                className='flex-1 bg-muted rounded-xl px-4 py-2 text-sm outline-none min-w-0 w-full'
              />

              <Button
                variant='outline'
                size='icon-sm'
                className='shrink-0 cursor-pointer'
              >
                <Send className='w-5 h-5 text-muted-foreground' />
              </Button>
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

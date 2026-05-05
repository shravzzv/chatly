'use client'

import { Button } from '@/components/ui/button'
import { useDashboardContext } from '@/providers/dashboard-provider'
import { FilePen } from 'lucide-react'
import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import MessageList from './message-list'

export default function ChatPanel() {
  const { selectedProfile, openProfileSelectDialog } = useDashboardContext()
  const { isTyping, updateTypingStatus } = useDashboardContext()

  if (!selectedProfile) {
    return (
      <div className='text-muted-foreground hidden h-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl md:flex'>
        <FilePen />
        <p>Select a chat to start messaging</p>
        <Button className='cursor-pointer' onClick={openProfileSelectDialog}>
          Send Message
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`relative flex h-full min-w-0 flex-1 flex-col rounded-xl ${
        selectedProfile ? 'flex' : 'hidden md:flex'
      }`}
    >
      <ChatHeader selectedProfile={selectedProfile} />
      <MessageList isTyping={isTyping} />

      <div className='absolute right-0 bottom-0 left-0 z-10 rounded-xl pb-4 backdrop-blur-sm'>
        <ChatInput updateTypingStatus={updateTypingStatus} />
      </div>
    </div>
  )
}

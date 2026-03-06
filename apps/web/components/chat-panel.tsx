'use client'

import { FilePen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChatHeader from './chat-header'
import MessageList from './message-list'
import ChatInput from './chat-input'
import { useTyping } from '@/hooks/use-typing'
import { useDashboardContext } from '@/providers/dashboard-provider'

export default function ChatPanel() {
  const { selectedProfile, selectedProfileId, openProfileSelectDialog } =
    useDashboardContext()
  const { isTyping, updateTypingStatus } = useTyping(selectedProfileId || null)

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

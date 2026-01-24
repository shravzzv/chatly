'use client'

import { FilePen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types/profile'
import { Message } from '@/types/message'
import ChatHeader from './chat-header'
import MessageList from './message-list'
import ChatInput from './chat-input'
import { useTyping } from '@/hooks/use-typing'

interface ChatPanelProps {
  selectedProfile: Profile | null
  messages: Message[]
  messagesLoading: boolean
  sendMessage: (text: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  editMessage: (id: string, text: string) => Promise<void>
  closeChatPanel: () => void
  openProfileSelectDialog: () => void
}

export default function ChatPanel({
  selectedProfile,
  messages,
  messagesLoading,
  sendMessage,
  deleteMessage,
  editMessage,
  closeChatPanel,
  openProfileSelectDialog,
}: ChatPanelProps) {
  const selectedProfileId = selectedProfile?.user_id
  const { isTyping, updateTypingStatus } = useTyping(selectedProfileId || null)

  if (!selectedProfile) {
    return (
      <div className='flex-1 hidden md:flex flex-col items-center justify-center gap-4 h-full text-muted-foreground min-w-0 rounded-xl'>
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
      className={`flex flex-col flex-1 h-full min-w-0 rounded-xl relative ${
        selectedProfile ? 'flex' : 'hidden md:flex'
      }`}
    >
      <ChatHeader
        selectedProfile={selectedProfile}
        closeChatPanel={closeChatPanel}
      />

      <MessageList
        messages={messages}
        messagesLoading={messagesLoading}
        isTyping={isTyping}
        deleteMessage={deleteMessage}
        editMessage={editMessage}
      />

      <div className='absolute bottom-0 left-0 right-0 z-10 pb-4 backdrop-blur-sm'>
        <ChatInput
          updateTypingStatus={updateTypingStatus}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  )
}

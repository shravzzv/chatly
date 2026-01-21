import { FilePen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types/profile'
import { Message } from '@/types/message'
import ChatHeader from './chat-header'
import MessageList from './message-list'
import ChatInput from './chat-input'

interface ChatPanelProps {
  selectedProfile: Profile | null
  messages: Message[]
  messagesLoading: boolean
  isTyping: boolean | null
  message: string
  isMobileView: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmitMessage: () => void
  handleDeleteMessage: (id: string) => void
  handleEditMessage: (id: string, updatedText: string) => void
  setIsProfileSelectDialogOpen: (value: boolean) => void
  setSelectedProfileId: (value: string | null) => void
}

export default function ChatPanel({
  selectedProfile,
  messages,
  messagesLoading,
  isTyping,
  message,
  messagesEndRef,
  handleMessageChange,
  handleSubmitMessage,
  handleDeleteMessage,
  handleEditMessage,
  setIsProfileSelectDialogOpen,
  setSelectedProfileId,
}: ChatPanelProps) {
  if (!selectedProfile) {
    return (
      <div className='flex-1 hidden md:flex flex-col items-center justify-center gap-4 h-full text-muted-foreground min-w-0 rounded-xl'>
        <FilePen />

        <p>Select a chat to start messaging</p>

        <Button
          className='cursor-pointer'
          onClick={() => setIsProfileSelectDialogOpen(true)}
        >
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
        setSelectedProfileId={setSelectedProfileId}
      />

      <MessageList
        messages={messages}
        selectedProfile={selectedProfile}
        messagesLoading={messagesLoading}
        messagesEndRef={messagesEndRef}
        isTyping={isTyping}
        handleDeleteMessage={handleDeleteMessage}
        handleEditMessage={handleEditMessage}
      />

      <div className='absolute bottom-0 left-0 right-0 z-10 pb-4 backdrop-blur-sm'>
        <ChatInput
          message={message}
          handleMessageChange={handleMessageChange}
          handleSubmitMessage={handleSubmitMessage}
        />
      </div>
    </div>
  )
}

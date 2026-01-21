import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from '@/components/message-bubble'
import { Badge } from '@/components/ui/badge'
import { formatDateHeader, groupMessagesByDate } from '@/lib/dashboard'
import TypingIndicator from '@/components/typing-indicator'
import { Profile } from '@/types/profile'
import { Message } from '@/types/message'
import MessageListSkeleton from './skeletons/message-list-skeleton'

interface MessageListProps {
  selectedProfile: Profile | null
  messages: Message[]
  messagesLoading: boolean
  isTyping: boolean | null
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  handleDeleteMessage: (id: string) => void
  handleEditMessage: (id: string, updatedText: string) => void
}

export default function MessageList({
  messages,
  messagesLoading,
  isTyping,
  messagesEndRef,
  handleDeleteMessage,
  handleEditMessage,
}: MessageListProps) {
  const isLoading = messagesLoading
  const isEmpty = messages.length === 0

  if (isLoading) {
    return <MessageListSkeleton />
  }

  if (isEmpty) {
    return (
      <p className='flex items-center justify-center h-full flex-1 overflow-y-auto p-4 text-muted-foreground'>
        No messages yet. Start the conversation!
      </p>
    )
  }

  return (
    <ScrollArea
      className='flex-1 overflow-y-auto px-4'
      data-testid='message-list'
    >
      {groupMessagesByDate(messages).map((group) => (
        <div key={group.date} className='relative'>
          <div className='flex justify-center sticky top-5 z-10'>
            <Badge>{formatDateHeader(new Date(group.date))}</Badge>
          </div>

          <div className='space-y-4'>
            {group.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                {...msg}
                onDelete={() => handleDeleteMessage(msg.id)}
                onEdit={(updatedText) => handleEditMessage(msg.id, updatedText)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className='pb-20'>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}

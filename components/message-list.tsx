'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from '@/components/message-bubble'
import { Badge } from '@/components/ui/badge'
import { groupMessagesByDate } from '@/lib/dashboard'
import TypingIndicator from '@/components/typing-indicator'
import { Message } from '@/types/message'
import MessageListSkeleton from './skeletons/message-list-skeleton'
import { useCallback, useEffect, useRef } from 'react'
import { formatDateHeader } from '@/lib/date'

interface MessageListProps {
  messages: Message[]
  messagesLoading: boolean
  isTyping: boolean
  deleteMessage: (id: string) => Promise<void>
  editMessage: (id: string, text: string) => Promise<void>
}

export default function MessageList({
  messages,
  messagesLoading,
  isTyping,
  deleteMessage,
  editMessage,
}: MessageListProps) {
  const isLoading = messagesLoading
  const isEmpty = messages.length === 0
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  /**
   * Scroll to the bottom of the list whenever the typing bubble appears.
   */
  useEffect(() => {
    if (isTyping) scrollToBottom()
  }, [isTyping, scrollToBottom])

  /**
   * Scroll to the bottom of the list whenever the message list changes
   * (e.g. after fetching messages for a newly selected conversation
   * or when a new message is appended).
   */
  useEffect(() => {
    if (messages.length > 0) scrollToBottom()
  }, [messages.length, scrollToBottom])

  if (isLoading) return <MessageListSkeleton />

  if (isEmpty) {
    return (
      <div className='flex items-center justify-center h-full flex-1 overflow-y-auto p-4 text-muted-foreground text-sm'>
        <p>No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <ScrollArea
      className='flex-1 overflow-y-auto px-4'
      data-testid='message-list'
    >
      {groupMessagesByDate(messages).map((group) => (
        <div key={group.date} className='relative'>
          <div className='flex justify-center sticky top-2 z-10 py-2'>
            <Badge variant='secondary'>
              {formatDateHeader(new Date(group.date))}
            </Badge>
          </div>

          <div className='space-y-4'>
            {group.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                deleteMessage={deleteMessage}
                editMessage={editMessage}
                {...msg}
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

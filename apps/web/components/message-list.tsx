'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { groupMessagesByDate } from '@/lib/dashboard'
import TypingIndicator from '@/components/typing-indicator'
import MessageListSkeleton from './skeletons/message-list-skeleton'
import { useCallback, useEffect, useRef } from 'react'
import MessageDateGroup from './message-date-group'
import { useDashboardContext } from '@/providers/dashboard-provider'

interface MessageListProps {
  isTyping: boolean
}

export default function MessageList({ isTyping }: MessageListProps) {
  const { messages, messagesLoading } = useDashboardContext()
  const isLoading = messagesLoading
  const isEmpty = messages.length === 0
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const prevMsgsLengthRef = useRef(0)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  /**
   * Scroll to the bottom of the list whenever the typing bubble appears.
   */
  useEffect(() => {
    if (isTyping) scrollToBottom()
  }, [isTyping, scrollToBottom])

  /**
   * Scroll to the bottom of the list when a profile is selected.
   */
  useEffect(() => {
    if (messages.length > prevMsgsLengthRef.current) {
      scrollToBottom('auto')
    }
    prevMsgsLengthRef.current = messages.length
  }, [messages.length, scrollToBottom])

  if (isLoading) return <MessageListSkeleton />

  if (isEmpty) {
    return (
      <div className='text-muted-foreground flex h-full flex-1 items-center justify-center overflow-y-auto p-4 text-sm'>
        <p>No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <ScrollArea
      className='relative flex-1 overflow-y-auto px-4'
      data-testid='message-list'
    >
      {groupMessagesByDate(messages).map((group) => (
        <MessageDateGroup
          key={group.date}
          date={group.date}
          messages={group.messages}
        />
      ))}

      <div className='pb-20'>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef}></div>
      </div>
    </ScrollArea>
  )
}

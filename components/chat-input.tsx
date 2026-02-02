'use client'

import { Send } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { useIsMobile } from '@/hooks/use-mobile'
import ChatInputDropdown from './chat-input-dropdown'
import { useRef, useState } from 'react'
import { useDashboardContext } from '@/providers/dashboard-provider'

interface ChatInputProps {
  updateTypingStatus: (isTyping: boolean) => Promise<void>
}

export default function ChatInput({ updateTypingStatus }: ChatInputProps) {
  const { sendMessage } = useDashboardContext()
  const isMobileView = useIsMobile()
  const [message, setMessage] = useState('')
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    if (value.trim()) {
      updateTypingStatus(true)
      typingTimeoutRef.current = setTimeout(updateTypingStatus, 3000, false)
    } else {
      updateTypingStatus(false)
    }
  }

  const handleSubmitMessage = async () => {
    if (!message.trim()) return
    updateTypingStatus(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    await sendMessage({ text: message })
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobileView) {
      e.preventDefault()
      handleSubmitMessage()
    }
  }

  return (
    <div className='flex gap-2 px-3 md:px-2 items-end w-full max-w-2xl mx-auto'>
      <ChatInputDropdown />

      <InputGroup className='flex items-end px-1 space-x-2 rounded-4xl bg-background dark:bg-background'>
        <InputGroupTextarea
          placeholder='Type a message...'
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          className='min-h-10 max-h-50 resize-none overflow-y-auto text-sm placeholder:text-muted-foreground focus-visible:ring-0 outline-none border-0'
        />

        <InputGroupAddon align='inline-end' className='shrink-0'>
          <InputGroupButton
            variant='default'
            size='icon-sm'
            className='cursor-pointer disabled:cursor-not-allowed rounded-full'
            onClick={handleSubmitMessage}
            disabled={!message.trim()}
            aria-label='Send message'
          >
            <Send className='w-5 h-5' />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

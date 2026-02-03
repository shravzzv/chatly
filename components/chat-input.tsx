'use client'

import { Send, Sparkles, Undo } from 'lucide-react'
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
import { Spinner } from './ui/spinner'
import { enhanceText } from '@/app/actions'
import { toast } from 'sonner'
import { Button } from './ui/button'

interface ChatInputProps {
  updateTypingStatus: (isTyping: boolean) => Promise<void>
}

export default function ChatInput({ updateTypingStatus }: ChatInputProps) {
  const { sendMessage } = useDashboardContext()
  const isMobileView = useIsMobile()
  const [message, setMessage] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const originalMessageRef = useRef<string | null>(null)

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
    if (!message.trim() || isEnhancing) return
    updateTypingStatus(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    await sendMessage({ text: message })
    setMessage('')
    originalMessageRef.current = null
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobileView) {
      e.preventDefault()
      handleSubmitMessage()
    }
  }

  const handleEnhanceUndo = () => {
    if (!originalMessageRef.current) return

    setMessage(originalMessageRef.current)
    originalMessageRef.current = null
  }

  const enhanceMessage = async () => {
    if (!message.trim()) return
    originalMessageRef.current = message

    try {
      setIsEnhancing(true)
      const enhancedText = await enhanceText(message)

      if (enhancedText.trim() === message.trim()) {
        toast.message('Already looks good ✨')
        originalMessageRef.current = null
        return
      }

      setMessage(enhancedText)
      toast.success('Message enhanced', {
        action: (
          <Button
            variant='secondary'
            size='xs'
            onClick={handleEnhanceUndo}
            className='cursor-pointer'
          >
            <Undo className='h-3.5 w-3.5' /> Undo
          </Button>
        ),
        duration: 8 * 1000,
        position: 'top-right',
      })
    } catch (error) {
      console.error(error)
      toast.error('AI enhancement failed')
    } finally {
      setIsEnhancing(false)
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
          disabled={isEnhancing}
        />

        <InputGroupAddon align='inline-end' className='shrink-0'>
          <InputGroupButton
            variant='secondary'
            size='icon-sm'
            className='cursor-pointer disabled:cursor-not-allowed rounded-full'
            onClick={enhanceMessage}
            disabled={!message.trim() || isEnhancing}
            title='Enhance message'
            aria-label='Enhance message'
          >
            {isEnhancing ? <Spinner /> : <Sparkles className='w-5 h-5' />}
          </InputGroupButton>
        </InputGroupAddon>

        <InputGroupAddon align='inline-end' className='shrink-0'>
          <InputGroupButton
            variant='default'
            size='icon-sm'
            className='cursor-pointer disabled:cursor-not-allowed rounded-full'
            onClick={handleSubmitMessage}
            disabled={!message.trim() || isEnhancing}
            title='Send message'
            aria-label='Send message'
          >
            <Send className='w-5 h-5' />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

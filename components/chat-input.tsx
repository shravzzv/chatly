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
  const [text, setText] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)

  const {
    sendMessage,
    canUseAi,
    openUpgradeAlertDialog,
    reflectUsageIncrement,
  } = useDashboardContext()
  const isMobileView = useIsMobile()

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const originalMessageRef = useRef<string | null>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setText(value)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    if (value.trim()) {
      updateTypingStatus(true)
      typingTimeoutRef.current = setTimeout(updateTypingStatus, 3000, false)
    } else {
      updateTypingStatus(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!text.trim() || isEnhancing) return
    updateTypingStatus(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    try {
      await sendMessage({ text })
      setText('')
      originalMessageRef.current = null
    } catch (error) {
      console.error(error)
      toast.error('Failed to send message')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobileView) {
      e.preventDefault()
      handleTextSubmit()
    }
  }

  const handleEnhanceUndo = () => {
    if (!originalMessageRef.current) return

    setText(originalMessageRef.current)
    originalMessageRef.current = null
  }

  const enhanceMessage = async () => {
    if (!canUseAi) {
      openUpgradeAlertDialog('ai')
      return
    }

    if (!text.trim()) return
    originalMessageRef.current = text

    try {
      setIsEnhancing(true)
      const enhancedText = await enhanceText(text)
      reflectUsageIncrement('ai')
      setText(enhancedText)

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
        duration: 4 * 1000,
        position: 'top-right',
      })
    } catch (error: unknown) {
      console.error(error)

      if (error instanceof Error) {
        switch (error.message) {
          case 'USER_ON_FREE_PLAN':
            toast.error('Upgrade your plan to use AI enhancements')
            break
          case 'USAGE_LIMIT_EXCEEDED':
            toast.error('Daily AI enhancements limit reached')
            break
          default:
            toast.error('AI enhancement failed')
        }
      }
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
          value={text}
          onChange={handleTextChange}
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
            disabled={!text.trim() || isEnhancing}
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
            onClick={handleTextSubmit}
            disabled={!text.trim() || isEnhancing}
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

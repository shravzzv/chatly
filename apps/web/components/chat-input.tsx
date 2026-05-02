'use client'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { useIsMobile } from '@/hooks/use-mobile'
import { useDashboardContext } from '@/providers/dashboard-provider'
import { createClient } from '@/utils/supabase/client'
import { Send, Sparkles, Undo } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import ChatInputDropdown from './chat-input-dropdown'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'

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

    try {
      const supabase = createClient()
      setIsEnhancing(true)
      originalMessageRef.current = text

      const { data, error } = await supabase.functions.invoke(
        'ai-enhance-text',
        { body: { text } },
      )

      if (error) throw error // supabase transport error
      if (data.error) throw Error(data.error) // business logic error

      setText(data.enhancedText)
      reflectUsageIncrement('ai')

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
    <div className='mx-auto flex w-full max-w-2xl items-end gap-2 px-3 md:px-2'>
      <ChatInputDropdown />

      <InputGroup className='bg-background dark:bg-background flex items-end space-x-2 rounded-4xl px-1'>
        <InputGroupTextarea
          placeholder='Type a message...'
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className='placeholder:text-muted-foreground max-h-50 min-h-10 resize-none overflow-y-auto border-0 text-sm outline-none focus-visible:ring-0'
          disabled={isEnhancing}
        />

        <InputGroupAddon align='inline-end' className='shrink-0'>
          <InputGroupButton
            variant='secondary'
            size='icon-sm'
            className='cursor-pointer rounded-full disabled:cursor-not-allowed'
            onClick={enhanceMessage}
            disabled={!text.trim() || isEnhancing}
            title='Enhance message'
            aria-label='Enhance message'
          >
            {isEnhancing ? <Spinner /> : <Sparkles className='h-5 w-5' />}
          </InputGroupButton>
        </InputGroupAddon>

        <InputGroupAddon align='inline-end' className='shrink-0'>
          <InputGroupButton
            variant='default'
            size='icon-sm'
            className='cursor-pointer rounded-full disabled:cursor-not-allowed'
            onClick={handleTextSubmit}
            disabled={!text.trim() || isEnhancing}
            title='Send message'
            aria-label='Send message'
          >
            <Send className='h-5 w-5' />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

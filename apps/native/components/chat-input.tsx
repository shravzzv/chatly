import { supabase } from '@/lib/supabase'
import { usePrivateContext } from '@/providers/private-provider'
import { Send, Sparkles, Undo } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { Platform, View } from 'react-native'
import { toast } from 'sonner-native'
import ChatInputDropdown from './chat-input-dropdown'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Spinner } from './ui/spinner'
import { Text } from './ui/text'
import { Textarea } from './ui/textarea'
import VoiceRecorder from './voice-recorder'

export default function ChatInput() {
  const [text, setText] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const {
    updateTypingStatus,
    sendMessage,
    canUseAi,
    reflectUsageIncrement,
    openUpgradeAlertDialog,
  } = usePrivateContext()
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const originalMessageRef = useRef<string | null>(null)

  const handleTextChange = (text: string) => {
    setText(text)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    if (text.trim()) {
      updateTypingStatus(true)
      typingTimeoutRef.current = setTimeout(updateTypingStatus, 3000, false)
    } else {
      updateTypingStatus(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!text.trim()) return
    updateTypingStatus(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    try {
      await sendMessage({ text })
      setText('')
    } catch (error) {
      console.error(error)
      toast.error('Failed to send message')
    }
  }

  const enhanceMessage = async () => {
    if (!canUseAi) {
      openUpgradeAlertDialog('ai')
      return
    }

    try {
      if (!text.trim()) return
      if (!supabase) throw Error('Supabase client not initialized')

      originalMessageRef.current = text
      setIsEnhancing(true)

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
            size='sm'
            onPress={handleEnhanceUndo}
            className='cursor-pointer'
          >
            <Icon as={Undo} className='h-3.5 w-3.5' />
            <Text>Undo</Text>
          </Button>
        ),
        duration: 4 * 1000,
      })
    } catch (error: unknown) {
      console.error('enhanceMessage error', error)

      if (error instanceof Error) {
        /**
         * The boolean `canUseAi` acts as the UI guard. But that's only the last line of defence.
         * Server side is the primary line of defence, and these toasts reflect errors
         * from there in case the dialog is bypassed.
         */
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

  const handleEnhanceUndo = () => {
    if (!originalMessageRef.current) return

    setText(originalMessageRef.current)
    originalMessageRef.current = null
  }

  return (
    <View className='mx-auto w-full max-w-sm shrink-0 flex-row items-end gap-2 rounded-full px-4 pb-2 sm:max-w-2xl sm:px-0'>
      {isVoiceRecorderOpen ? (
        <VoiceRecorder closeRecorder={() => setIsVoiceRecorderOpen(false)} />
      ) : (
        <>
          <ChatInputDropdown
            openVoiceRecorder={() => setIsVoiceRecorderOpen(true)}
          />

          <View className='flex-1 flex-row items-end gap-2 rounded-3xl border border-border px-1.5 py-0.5 pl-1'>
            <Textarea
              numberOfLines={Platform.select({ web: 1, native: 5 })}
              placeholder='Type a message...'
              className='min-h-10 flex-1 resize-none rounded-xl border-0 border-none text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 active:outline-none dark:bg-transparent'
              value={text}
              onChangeText={handleTextChange}
              onSubmitEditing={handleTextSubmit}
              editable={!isEnhancing}
            />

            <View className='flex-row items-center gap-1.5 py-1 pb-1'>
              <Button
                variant='secondary'
                size='icon'
                className='size-8 shrink-0 rounded-full'
                disabled={!text.trim() || isEnhancing}
                onPress={enhanceMessage}
              >
                {isEnhancing ? (
                  <Spinner />
                ) : (
                  <Icon as={Sparkles} className='size-4' />
                )}
              </Button>

              <Button
                size='icon'
                className='size-8 shrink-0 rounded-full'
                onPress={handleTextSubmit}
                disabled={!text.trim() || isEnhancing}
              >
                <Icon as={Send} className='size-4 text-primary-foreground' />
              </Button>
            </View>
          </View>
        </>
      )}
    </View>
  )
}

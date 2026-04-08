import { Send, Sparkles } from 'lucide-react-native'
import { useState } from 'react'
import { Platform, View } from 'react-native'
import ChatInputDropdown from './chat-input-dropdown'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Textarea } from './ui/textarea'
import VoiceRecorder from './voice-recorder'

export default function ChatInput() {
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false)

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
            />

            <View className='flex-row items-center gap-1.5 py-1 pb-1'>
              <Button
                variant='secondary'
                size='icon'
                className='size-8 shrink-0 rounded-full'
              >
                <Icon as={Sparkles} className='size-4' />
              </Button>

              <Button size='icon' className='size-8 shrink-0 rounded-full'>
                <Icon as={Send} className='size-4 text-primary-foreground' />
              </Button>
            </View>
          </View>
        </>
      )}
    </View>
  )
}

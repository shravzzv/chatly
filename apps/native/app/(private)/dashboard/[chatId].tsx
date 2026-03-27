// apps/native/app/(private)/dashboard/[chatId].tsx
import ChatHeader from '@/components/chat-header'
import ChatInput from '@/components/chat-input'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { ArrowLeft, Pen, Trash } from 'lucide-react-native'
import { useLayoutEffect } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'

export interface Message {
  id: string
  text: string | null
  sender_id: string
  receiver_id: string
  created_at: string
  updated_at: string
}

export default function Page() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>()
  const navigation = useNavigation()

  const messages: Message[] = [
    {
      id: '1',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Hey! Did you see the latest push to the main branch?',
      created_at: '2026-03-24T10:00:00Z',
      updated_at: '2026-03-24T10:00:00Z',
    },
    {
      id: '2',
      sender_id: 'user_2',
      receiver_id: 'user_1',
      text: 'Not yet, just grabbing coffee. What did you change?',
      created_at: '2026-03-24T10:02:15Z',
      updated_at: '2026-03-24T10:02:15Z',
    },
    {
      id: '3',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Refactored the PasswordInput component to use default args instead of the OR operator. Much cleaner.',
      created_at: '2026-03-24T10:03:45Z',
      updated_at: '2026-03-24T10:03:45Z',
    },
    {
      id: '4',
      sender_id: 'user_2',
      receiver_id: 'user_1',
      text: 'Nice move. Does it handle the empty string edge case now?',
      created_at: '2026-03-24T10:05:00Z',
      updated_at: '2026-03-24T10:05:00Z',
    },
    {
      id: '5',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Exactly. 🎯',
      created_at: '2026-03-24T10:05:30Z',
      updated_at: '2026-03-24T10:05:30Z',
    },
    {
      id: '6',
      sender_id: 'user_2',
      receiver_id: 'user_1',
      text: 'By the way, are we still on for the 2 PM meeting about the Supabase auth flow?',
      created_at: '2026-03-24T10:10:00Z',
      updated_at: '2026-03-24T10:10:00Z',
    },
    {
      id: '7',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Yeah, I just need to finish mocking the deep link tests first.',
      created_at: '2026-03-24T10:11:20Z',
      updated_at: '2026-03-24T10:11:20Z',
    },
    {
      id: '8',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Testing the "forgot password" redirects is proving to be a bit tricky with expo-linking.',
      created_at: '2026-03-24T10:12:05Z',
      updated_at: '2026-03-24T10:12:05Z',
    },
    {
      id: '9',
      sender_id: 'user_2',
      receiver_id: 'user_1',
      text: 'I bet. Let me know if you need a hand with the Jest mocks.',
      created_at: '2026-03-24T10:15:00Z',
      updated_at: '2026-03-24T10:15:00Z',
    },
    {
      id: '10',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Will do! 🚀',
      created_at: '2026-03-24T10:16:00Z',
      updated_at: '2026-03-24T10:16:00Z',
    },
    {
      id: '11',
      sender_id: 'user_2',
      receiver_id: 'user_1',
      text: 'Wait, did you update the README with the new env variables?',
      created_at: '2026-03-24T11:45:00Z',
      updated_at: '2026-03-24T11:45:00Z',
    },
    {
      id: '12',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Oh, forgot about that. Doing it now.',
      created_at: '2026-03-24T11:46:10Z',
      updated_at: '2026-03-24T11:46:10Z',
    },
    {
      id: '13',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Done. Also added a section on the new theme tokens.',
      created_at: '2026-03-24T11:50:00Z',
      updated_at: '2026-03-24T11:50:00Z',
    },
    {
      id: '14',
      sender_id: 'user_2',
      receiver_id: 'user_1',
      text: 'Perfect. The UI is looking much more cohesive with NativeWind.',
      created_at: '2026-03-24T11:52:00Z',
      updated_at: '2026-03-24T11:52:00Z',
    },
    {
      id: '15',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Agree. The "Peace of Mind" of a shared design system is real.',
      created_at: '2026-03-24T11:55:30Z',
      updated_at: '2026-03-24T11:55:30Z',
    },
    {
      id: '16',
      sender_id: 'user_2',
      receiver_id: 'user_1',
      text: 'Are we hitting the limit on the free tier for Supabase yet? lol',
      created_at: '2026-03-24T13:00:00Z',
      updated_at: '2026-03-24T13:00:00Z',
    },
    {
      id: '17',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'Not even close. We have plenty of leverage left.',
      created_at: '2026-03-24T13:02:00Z',
      updated_at: '2026-03-24T13:02:00Z',
    },
    {
      id: '18',
      sender_id: 'user_2',
      receiver_id: 'user_1',
      text: 'Good to hear. See you in the meeting!',
      created_at: '2026-03-24T13:55:00Z',
      updated_at: '2026-03-24T13:55:00Z',
    },
    {
      id: '19',
      sender_id: 'user_1',
      receiver_id: 'user_2',
      text: 'In the lobby now.',
      created_at: '2026-03-24T14:00:05Z',
      updated_at: '2026-03-24T14:00:05Z',
    },
    {
      id: '20',
      sender_id: 'user_2',
      receiver_id: 'user_1',
      text: 'On my way!',
      created_at: '2026-03-24T14:01:20Z',
      updated_at: '2026-03-24T14:01:20Z',
    },
  ]

  useLayoutEffect(() => {
    if (!chatId) return

    navigation.setOptions({
      headerLeft: () => (
        <Button
          variant='ghost'
          size='icon'
          onPress={() => router.replace('/dashboard')}
          className={cn(Platform.OS === 'web' && 'ml-6')}
        >
          <Icon as={ArrowLeft} className='size-6' />
        </Button>
      ),

      headerTitle: () => <ChatHeader chatId={chatId} />,
    })
  }, [chatId, navigation])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      contentContainerStyle={{}}
    >
      <Screen className='gap-2 px-0 py-0 md:py-0'>
        <ScrollView
          className='mx-auto w-full max-w-2xl flex-1 px-4'
          keyboardShouldPersistTaps='handled'
        >
          {messages.map((message, idx) => {
            const isOwn = message.receiver_id === 'user_1'

            return (
              <View
                key={idx}
                className={cn(isOwn ? 'self-end' : 'self-start', 'gap-2 py-1')}
              >
                <Text
                  className={cn(
                    isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted',
                    'max-w-[85%] rounded-3xl px-4 py-2.5 text-sm sm:max-w-xs',
                  )}
                >
                  {message.text}
                </Text>

                <Text
                  className={cn(
                    isOwn ? 'self-end' : 'self-start',
                    'text-[10px] text-muted-foreground',
                  )}
                >
                  {new Date(message.updated_at).toLocaleTimeString(undefined, {
                    timeStyle: 'short',
                  })}
                </Text>

                {Platform.OS === 'web' && (
                  <View
                    className={cn(
                      isOwn ? 'justify-end' : 'justify-start',
                      'flex-row items-center',
                    )}
                  >
                    <Button variant='ghost' size='icon' className='p-0'>
                      <Icon as={Pen} className='size-4 text-muted-foreground' />
                    </Button>

                    <Button variant='ghost' size='icon'>
                      <Icon
                        as={Trash}
                        className='size-4 text-muted-foreground'
                      />
                    </Button>
                  </View>
                )}
              </View>
            )
          })}
        </ScrollView>

        <ChatInput />
      </Screen>
    </KeyboardAvoidingView>
  )
}

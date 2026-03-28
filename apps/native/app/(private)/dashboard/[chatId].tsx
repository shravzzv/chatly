// apps/native/app/(private)/dashboard/[chatId].tsx
import ChatHeader from '@/components/chat-header'
import ChatInput from '@/components/chat-input'
import { Message } from '@/components/message'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { Message as MessageType } from '@/types/message'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useLayoutEffect } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native'

const messages: MessageType[] = [
  {
    id: 'm1',
    sender_id: 'user_1',
    receiver_id: 'user_2',
    text: 'Hey!',
    created_at: '2026-03-27T09:00:00Z',
    updated_at: '2026-03-28T09:00:00Z',
  },
  {
    id: 'm2',
    sender_id: 'user_2',
    receiver_id: 'user_1',
    text: null,
    created_at: '2026-03-28T09:01:30Z',
    updated_at: '2026-03-28T09:01:30Z',
    attachment: {
      id: 'a1',
      message_id: 'm2',
      path: 'https://images.unsplash.com/photo-1685549926037-2b0b4d2fe7f3?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      file_name: 'logo_v1_draft.png',
      mime_type: 'image/png',
      size: 154200,
      created_at: '2026-03-28T09:01:30Z',
    },
  },
  {
    id: 'm3',
    sender_id: 'user_1',
    receiver_id: 'user_2',
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit repellendus voluptatem atque necessitatibus accusamus? Architecto perferendis beatae earum molestiae placeat magnam nostrum eum, velit tenetur a, quisquam cumque distinctio modi.',
    created_at: '2026-03-28T09:05:00Z',
    updated_at: '2026-03-28T09:05:00Z',
  },
  {
    id: 'm4',
    sender_id: 'user_2',
    receiver_id: 'user_1',
    text: 'Glad you like it! I recorded a quick walkthrough of the color palette logic.',
    created_at: '2026-03-28T10:10:00Z',
    updated_at: '2026-03-28T10:10:00Z',
  },
  {
    id: 'm5',
    sender_id: 'user_1',
    receiver_id: 'user_2',
    text: null, // Video attachment
    created_at: '2026-03-28T10:11:00Z',
    updated_at: '2026-03-28T10:11:00Z',
    attachment: {
      id: 'a2',
      message_id: 'm5',
      path: 'https://images.unsplash.com/photo-1586952205040-22514ffab1a1?q=80&w=612&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      file_name: 'design_walkthrough.mp4',
      mime_type: 'video/mp4',
      size: 1048576,
      created_at: '2026-03-28T10:11:00Z',
    },
  },
  {
    id: 'm6',
    sender_id: 'user_2',
    receiver_id: 'user_1',
    text: null, // PDF attachment
    created_at: '2026-03-28T11:00:00Z',
    updated_at: '2026-03-28T11:00:00Z',
    attachment: {
      id: 'a3',
      message_id: 'm6',
      path: 'https://images.unsplash.com/photo-1558748114-079f42439efa?q=80&w=1959&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      file_name: 'feedback_notes.pdf',
      mime_type: 'application/pdf',
      size: 245000,
      created_at: '2026-03-28T11:00:00Z',
    },
  },
  {
    id: 'm7',
    sender_id: 'user_1',
    receiver_id: 'user_2',
    text: 'Checking the PDF now. I see what you mean about the contrast ratios.',
    created_at: '2026-03-28T11:15:00Z',
    updated_at: '2026-03-28T11:15:00Z',
  },
  {
    id: 'm8',
    sender_id: 'user_2',
    receiver_id: 'user_1',
    text: null, // Audio attachment
    created_at: '2026-03-28T11:30:00Z',
    updated_at: '2026-03-28T11:30:00Z',
    attachment: {
      id: 'a4',
      message_id: 'm8',
      path: 'https://images.unsplash.com/photo-1632710334584-89714f84ba2c?q=80&w=881&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      file_name: 'voice_memo_04.mp3',
      mime_type: 'audio/mpeg',
      size: 320000,
      created_at: '2026-03-28T11:30:00Z',
    },
  },
  {
    id: 'm9',
    sender_id: 'user_1',
    receiver_id: 'user_2',
    text: 'Understood. I will push the final CSS variables tonight.',
    created_at: '2026-03-28T12:00:00Z',
    updated_at: '2026-03-28T12:00:00Z',
  },
  {
    id: 'm10',
    sender_id: 'user_2',
    receiver_id: 'user_1',
    text: 'Perfect.',
    created_at: '2026-03-28T12:05:00Z',
    updated_at: '2026-03-28T12:05:00Z',
  },
  {
    id: 'm11',
    sender_id: 'user_2',
    receiver_id: 'user_1',
    text: null, // Audio attachment
    created_at: '2026-03-28T11:30:00Z',
    updated_at: '2026-03-28T11:30:00Z',
    attachment: {
      id: 'a5',
      message_id: 'm11',
      path: 'https://images.unsplash.com/photo-1677230532477-9b031a24c4bc?q=80&w=524&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      file_name: 'voice_memo_04.mp3',
      mime_type: 'audio/mpeg',
      size: 320000,
      created_at: '2026-03-28T11:30:00Z',
    },
  },
  {
    id: 'm12',
    sender_id: 'user_1',
    receiver_id: 'user_2',
    text: null, // Audio attachment
    created_at: '2026-03-28T11:30:00Z',
    updated_at: '2026-03-28T11:30:00Z',
    attachment: {
      id: 'a6',
      message_id: 'm12',
      path: 'https://images.unsplash.com/photo-1615003162333-d3ff3ce1f0f4?q=80&w=1860&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      file_name: 'voice_memo_04.mp3',
      mime_type: 'audio/mpeg',
      size: 320000,
      created_at: '2026-03-28T11:30:00Z',
    },
  },
]

export default function Page() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>()
  const navigation = useNavigation()

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
    >
      <Screen className='gap-2 px-0 py-0 md:py-0'>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          className='mx-auto w-full max-w-2xl flex-1'
          contentContainerClassName={cn(
            messages.length === 0 && 'flex-1',
            'gap-2 px-4 rounded-lg',
          )}
          renderItem={({ item: message }) => <Message message={message} />}
          ListEmptyComponent={() => (
            <View className='flex-1 items-center justify-center'>
              <Text className='text-sm text-muted-foreground'>
                No messages yet
              </Text>
            </View>
          )}
        />

        <ChatInput />
      </Screen>
    </KeyboardAvoidingView>
  )
}

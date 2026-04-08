import ChatHeader from '@/components/chat-header'
import ChatInput from '@/components/chat-input'
import { Message } from '@/components/message'
import TypingIndicator from '@/components/typing-indicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { formatDateHeader } from '@/lib/date'
import { groupMessagesByDate } from '@/lib/messages'
import { cn } from '@/lib/utils'
import type { Message as MessageType } from '@/types/message'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { ArrowDown, ArrowLeft } from 'lucide-react-native'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SectionList,
  View,
} from 'react-native'

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
    id: 'm4',
    sender_id: 'user_2',
    receiver_id: 'user_1',
    text: 'Glad you like it! I recorded a quick walkthrough of the color palette logic.',
    created_at: '2026-03-28T10:10:00Z',
    updated_at: '2026-03-28T10:10:00Z',
  },
  {
    id: 'm16',
    sender_id: 'user_2',
    receiver_id: 'user_1',
    text: null,
    created_at: '2026-03-28T10:11:00Z',
    updated_at: '2026-03-28T10:11:00Z',
    attachment: {
      id: 'a9',
      message_id: 'm15',
      path: 'https://b6dae883-ee6c-4715-a7e7-f9922bf7c77e.mdnplay.dev/shared-assets/audio/t-rex-roar.mp3',
      file_name: `books I've read from 2022-2024 (export of Notion's deleted reading list).csv`,
      mime_type: 'text/csv',
      size: 1048576,
      created_at: '2026-03-28T10:11:00Z',
    },
  },

  {
    id: 'm17',
    sender_id: 'user_1',
    receiver_id: 'user_2',
    text: null,
    created_at: '2026-03-28T10:11:00Z',
    updated_at: '2026-03-28T10:11:00Z',
    attachment: {
      id: 'a10',
      message_id: 'm17',
      path: 'https://b6dae883-ee6c-4715-a7e7-f9922bf7c77e.mdnplay.dev/shared-assets/audio/t-rex-roar.mp3',
      file_name: `log_list.json`,
      mime_type: 'application/json',
      size: 1048576,
      created_at: '2026-03-28T10:11:00Z',
    },
  },
  {
    id: 'm14',
    sender_id: 'user_2',
    receiver_id: 'user_1',
    text: null,
    created_at: '2026-03-28T10:11:00Z',
    updated_at: '2026-03-28T10:11:00Z',
    attachment: {
      id: 'a8',
      message_id: 'm14',
      path: 'https://b6dae883-ee6c-4715-a7e7-f9922bf7c77e.mdnplay.dev/shared-assets/audio/t-rex-roar.mp3',
      file_name: 'design_walkthrough.mp4',
      mime_type: 'audio/mpeg',
      size: 1048576,
      created_at: '2026-03-28T10:11:00Z',
    },
  },
  {
    id: 'm15',
    sender_id: 'user_1',
    receiver_id: 'user_2',
    text: null,
    created_at: '2026-03-28T10:11:00Z',
    updated_at: '2026-03-28T10:11:00Z',
    attachment: {
      id: 'a9',
      message_id: 'm15',
      path: 'https://b6dae883-ee6c-4715-a7e7-f9922bf7c77e.mdnplay.dev/shared-assets/audio/t-rex-roar.mp3',
      file_name: 'design_walkthrough.mp4',
      mime_type: 'audio/mpeg',
      size: 1048576,
      created_at: '2026-03-28T10:11:00Z',
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
      mime_type: 'image/png',
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
      mime_type: 'image/png',
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
      mime_type: 'image/png',
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
      mime_type: 'image/png',
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
      mime_type: 'image/png',
      size: 320000,
      created_at: '2026-03-28T11:30:00Z',
    },
  },
]

export default function Page() {
  const [showScrollToBottomBtn, setShowScrollToBottomBtn] = useState(false)
  const { chatId } = useLocalSearchParams<{ chatId?: string }>()
  const listRef = useRef<SectionList<MessageType>>(null)
  const hasScrolledInitially = useRef<boolean>(false)
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigation = useNavigation()
  const sections = groupMessagesByDate(messages)
  const isTyping = true

  const scrollToBottom = useCallback(
    ({ animated = true }: { animated?: boolean } = {}) => {
      listRef.current?.getScrollResponder()?.scrollToEnd({ animated })
    },
    [],
  )

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent

    const threshold = 200

    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold

    setShowScrollToBottomBtn(!isNearBottom)
  }

  const onContentSizeChange = () => {
    if (hasScrolledInitially.current || sections.length === 0) return
    if (timeoutId.current) clearTimeout(timeoutId.current)

    // wait for content to stop changing
    timeoutId.current = setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToBottom({ animated: false })
        hasScrolledInitially.current = true
      })
    }, 60)
  }

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

  useEffect(() => {
    if (isTyping) scrollToBottom()
  }, [isTyping, scrollToBottom])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <Screen className='gap-2 px-0 py-0 md:py-0'>
        <SectionList
          ref={listRef}
          keyExtractor={(item) => item.id}
          sections={sections}
          stickySectionHeadersEnabled
          renderItem={({ item: message }) => <Message message={message} />}
          renderSectionHeader={({ section: { date } }) => (
            <View className='items-center py-2'>
              <Badge variant='secondary'>
                <Text>{formatDateHeader(new Date(date))}</Text>
              </Badge>
            </View>
          )}
          ListFooterComponent={() => (
            <View className={cn(isTyping && 'pb-4')}>
              {isTyping && <TypingIndicator />}
            </View>
          )}
          ListEmptyComponent={() => (
            <View className='flex-1 items-center justify-center'>
              <Text className='text-sm text-muted-foreground'>
                No messages yet
              </Text>
            </View>
          )}
          style={{
            maxWidth: 672,
            margin: 'auto',
            width: '100%',
            flex: 1,
          }}
          contentContainerStyle={{
            flex: sections.length === 0 ? 1 : undefined,
            paddingLeft: 16,
            paddingRight: 16,
            gap: 8,
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={onContentSizeChange}
        />

        {showScrollToBottomBtn && (
          <Button
            variant='outline'
            size='icon'
            className='absolute bottom-20 right-1/2 z-20 translate-x-1/2 rounded-full dark:bg-background'
            onPress={() => scrollToBottom()}
          >
            <Icon as={ArrowDown} className='size-6' />
          </Button>
        )}

        <ChatInput />
      </Screen>
    </KeyboardAvoidingView>
  )
}

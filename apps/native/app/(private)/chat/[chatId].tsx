import ChatHeader from '@/components/chat-header'
import ChatInput from '@/components/chat-input'
import { Message } from '@/components/message'
import MessageListSkeleton from '@/components/skeletons/message-list-skeleton'
import TypingIndicator from '@/components/typing-indicator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { useMessages } from '@/hooks/use-messages'
import { formatDateHeader } from '@/lib/date'
import { groupMessagesByDate } from '@/lib/messages'
import { cn } from '@/lib/utils'
import type { Message as MessageType } from '@chatly/types/message'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { ArrowDown, ArrowLeft, Info } from 'lucide-react-native'
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

export default function Page() {
  const [showScrollToBottomBtn, setShowScrollToBottomBtn] = useState(false)
  const { chatId } = useLocalSearchParams<{ chatId?: string }>()
  const listRef = useRef<SectionList<MessageType>>(null)
  const hasScrolledInitially = useRef<boolean>(false)
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigation = useNavigation()
  const isTyping = false

  const updatePreview = useCallback(() => {}, [])
  const deletePreview = useCallback(async () => {}, [])

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    deleteMessage,
    editMessage,
  } = useMessages({
    selectedProfileId: chatId ?? null,
    updatePreview,
    deletePreview,
  })

  const sections = groupMessagesByDate(messages)

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

  if (messagesLoading) return <MessageListSkeleton />

  if (messagesError) {
    return (
      <Screen className='items-center justify-center'>
        <Alert icon={Info} variant='destructive' className='mx-auto max-w-lg'>
          <AlertTitle className='font-bold'>
            Fetching messages failed.
          </AlertTitle>
          <AlertDescription>
            Your connection might be down or there is an error from our side.
            Try again after some time. Contact support if error persists.{' '}
          </AlertDescription>
        </Alert>
      </Screen>
    )
  }

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

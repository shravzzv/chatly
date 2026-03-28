import { cn } from '@/lib/utils'
import type { Message as MessageType } from '@/types/message'
import { Platform, View } from 'react-native'
import MessageActions from './message-actions'
import MessageContent from './message-content'
import MessageMetadata from './message-metadata'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const isOwn = message.receiver_id === 'user_1'

  const hasText =
    typeof message.text === 'string' && message.text.trim().length > 0
  const hasAttachment = !!message.attachment

  if (!hasText && !hasAttachment) return null

  return (
    <View
      className={cn(
        isOwn ? 'items-end' : 'items-start',
        'w-full gap-2 rounded-lg',
      )}
    >
      <View
        className={cn(
          isOwn ? 'items-end' : 'items-start',
          'w-full max-w-[80%] rounded-lg sm:max-w-[60%]',
        )}
      >
        <MessageContent message={message} isOwn={isOwn} />
      </View>

      <MessageMetadata message={message} />

      {Platform.OS === 'web' && (
        <MessageActions message={message} isOwn={isOwn} />
      )}
    </View>
  )
}

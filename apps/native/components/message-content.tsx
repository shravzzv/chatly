import { cn } from '@/lib/utils'
import type { Message } from '@/types/message'
import MessageAttachment from './message-attachment'
import { Text } from './ui/text'

interface MessageContentProps {
  message: Message
  isOwn: boolean
}

export default function MessageContent({
  message,
  isOwn,
}: MessageContentProps) {
  const attachment = message.attachment

  if (attachment) return <MessageAttachment attachment={attachment} />

  return (
    <Text
      className={cn(
        isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted',
        'rounded-2xl px-3 py-2 text-sm',
      )}
    >
      {message.text}
    </Text>
  )
}

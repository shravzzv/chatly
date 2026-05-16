import { cn } from '@/lib/utils'
import { getAttachmentKind } from '@chatly/lib/messages'
import type { Message } from '@chatly/types/message'
import MessageAttachment from './message-attachment'
import MessageAttachmentSkeleton from './skeletons/message-attachment-skeleton'
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

  if (attachment) {
    const attachmentKind = getAttachmentKind(attachment.mime_type)

    // 'optimistic' is only used as an optimistic update while uploading
    return attachment.id === 'optimistic' ? (
      <MessageAttachmentSkeleton kind={attachmentKind} />
    ) : (
      <MessageAttachment attachment={attachment} />
    )
  }

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

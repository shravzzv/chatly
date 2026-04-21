import { getAttachmentKind } from '@/lib/messages'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import type { Message } from '@chatly/types/message'
import MessageAttachment from './message-attachment'
import MessageAttachmentSkeleton from './skeletons/message-attachment-skeleton'

interface MessageContentProps {
  message: Message
}

export default function MessageContent({ message }: MessageContentProps) {
  const currentUser = useChatlyStore((state) => state.user)
  const isOwn = message.sender_id === currentUser?.id
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
    <p
      className={`rounded-2xl px-3 py-2 text-sm ${
        isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}
    >
      {message.text}
    </p>
  )
}

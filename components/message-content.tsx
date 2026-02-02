import type { Message } from '@/types/message'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import MessageAttachment from './message-attachment'
import MessageAttachmentSkeleton from './skeletons/message-attachment-skeleton'
import { getAttachmentKind } from '@/lib/messages'

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
      className={`px-3 py-2 rounded-2xl text-sm ${
        isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}
    >
      {message.text}
    </p>
  )
}

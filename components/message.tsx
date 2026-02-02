'use client'

import { useChatlyStore } from '@/providers/chatly-store-provider'
import { Message as MessageType } from '@/types/message'
import MessageContent from './message-content'
import MessageMetadata from './message-metadata'
import MessageActions from './message-actions'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const currentUser = useChatlyStore((state) => state.user)
  const isOwn = message.sender_id === currentUser?.id

  const hasText =
    typeof message.text === 'string' && message.text.trim().length > 0
  const hasAttachment = !!message.attachment

  if (!hasText && !hasAttachment) return null

  return (
    <div
      className={`flex flex-col space-y-1.5 ${isOwn ? 'items-end' : 'items-start'}`}
    >
      <div className='max-w-2xs rounded-2xl'>
        <MessageContent message={message} />
      </div>

      <MessageMetadata message={message} />
      <MessageActions message={message} />
    </div>
  )
}

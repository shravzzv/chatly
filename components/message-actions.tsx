'use client'

import { Message } from '@/types/message'
import EditMessageTextAction from './edit-message-text-action'
import DeleteMessageAction from './delete-message-action'
import DownloadAttachmentAction from './download-attachment-action'
import { useChatlyStore } from '@/providers/chatly-store-provider'

interface MessageActionsProps {
  message: Message
}

export default function MessageActions({ message }: MessageActionsProps) {
  const { id, text } = message
  const currentUser = useChatlyStore((state) => state.user)
  const isOwn = message.sender_id === currentUser?.id

  const showEdit = isOwn && text && !message.attachment
  const showDelete = isOwn
  const showDownload = !text && message.attachment

  return (
    <div className='flex items-center'>
      {showEdit && <EditMessageTextAction id={id} text={text} />}
      {showDelete && <DeleteMessageAction id={id} />}
      {showDownload && <DownloadAttachmentAction message={message} />}
    </div>
  )
}

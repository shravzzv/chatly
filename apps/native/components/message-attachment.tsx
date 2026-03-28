import { MessageAttachment as MessageAttachmentType } from '@/types/message-attachment'
import ImageAttachment from './image-attachment'

interface MessageAttachmentProps {
  attachment: MessageAttachmentType
}

export default function MessageAttachment({
  attachment,
}: MessageAttachmentProps) {
  return <ImageAttachment attachment={attachment} signedUrl={attachment.path} />
}

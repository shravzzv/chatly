import type {
  MessageAttachmentKind,
  MessageAttachment as MessageAttachmentType,
} from '@/types/message-attachment'
import AudioAttachment from './audio-attachment'
import FileAttachment from './file-attachment'
import ImageAttachment from './image-attachment'
import VideoAttachment from './video-attachment'

interface MessageAttachmentProps {
  attachment: MessageAttachmentType
}

export const getAttachmentKind = (mimeType: string): MessageAttachmentKind => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'file'
}

export default function MessageAttachment({
  attachment,
}: MessageAttachmentProps) {
  const attachmentKind = getAttachmentKind(attachment.mime_type)
  const signedUrl = attachment.path

  switch (attachmentKind) {
    case 'image':
      return <ImageAttachment attachment={attachment} signedUrl={signedUrl} />
    case 'video':
      return <VideoAttachment signedUrl={signedUrl} />
    case 'audio':
      return <AudioAttachment signedUrl={signedUrl} />
    default:
      return <FileAttachment attachment={attachment} signedUrl={signedUrl} />
  }
}

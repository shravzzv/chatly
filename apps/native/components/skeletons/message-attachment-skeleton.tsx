import { MessageAttachmentKind } from '@chatly/types/message-attachment'
import { Skeleton } from '../ui/skeleton'
import AudioAttachmentSkeleton from './audio-attachment-skeleton'
import FileAttachmentSkeleton from './file-attachment-skeleton'

interface MessageAttachmentSkeletonProps {
  kind: MessageAttachmentKind
}

export default function MessageAttachmentSkeleton({
  kind,
}: MessageAttachmentSkeletonProps) {
  switch (kind) {
    case 'image':
      return (
        <Skeleton className='aspect-square w-full max-w-xs cursor-progress rounded-xl' />
      )

    case 'video':
      return (
        <Skeleton className='h-40 w-full max-w-xs cursor-progress rounded-xl debug' />
      )

    case 'audio':
      return <AudioAttachmentSkeleton />

    default:
      return <FileAttachmentSkeleton />
  }
}

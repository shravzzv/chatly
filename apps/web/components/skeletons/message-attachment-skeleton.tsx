import { MessageAttachmentKind } from '@chatly/types/message-attachment'
import { Skeleton } from '../ui/skeleton'
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
        <Skeleton className='aspect-square w-[320px] max-w-2xs cursor-progress rounded-xl shadow' />
      )

    case 'video':
      return (
        <Skeleton className='aspect-video w-[320px] max-w-2xs cursor-progress rounded-xl shadow' />
      )

    case 'audio':
      return (
        <Skeleton className='aspect-square h-16 w-[320px] max-w-2xs cursor-progress rounded-xl shadow' />
      )

    default:
      return <FileAttachmentSkeleton />
  }
}

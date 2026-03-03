import { Skeleton } from '../ui/skeleton'
import { MessageAttachmentKind } from '@/types/message-attachment'
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
        <Skeleton className='w-[320px] max-w-2xs rounded-xl shadow aspect-square cursor-progress' />
      )

    case 'video':
      return (
        <Skeleton className='w-[320px] max-w-2xs rounded-xl shadow aspect-video cursor-progress' />
      )

    case 'audio':
      return (
        <Skeleton className='w-[320px] max-w-2xs h-16 rounded-xl shadow aspect-square cursor-progress' />
      )

    default:
      return <FileAttachmentSkeleton />
  }
}

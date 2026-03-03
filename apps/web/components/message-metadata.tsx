import { formatEditedTimestamp } from '@/lib/date'
import { Message } from '@/types/message'

interface MessageMetadataProps {
  message: Message
}

export default function MessageMetadata({ message }: MessageMetadataProps) {
  const { created_at, updated_at } = message

  const createdTime = new Date(created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const hasMeaningfulEdit =
    new Date(updated_at).getTime() - new Date(created_at).getTime() > 60000

  return (
    <div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
      <span>{createdTime}</span>

      {hasMeaningfulEdit && (
        <span>(edited {formatEditedTimestamp(created_at, updated_at)})</span>
      )}
    </div>
  )
}

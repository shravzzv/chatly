import { Skeleton } from './ui/skeleton'

interface ConversationPreviewSubtitleProps {
  message?: string
  isLoading: boolean
  isOwnMessage: boolean
}

export default function ConversationPreviewSubtitle({
  message,
  isLoading,
  isOwnMessage,
}: ConversationPreviewSubtitleProps) {
  if (isLoading) return <Skeleton className='h-4 w-24 rounded-md' />

  const text = message
    ? `${isOwnMessage ? 'You: ' : ''}${message}`
    : 'No messages yet'

  return <p className='text-xs text-muted-foreground truncate'>{text}</p>
}

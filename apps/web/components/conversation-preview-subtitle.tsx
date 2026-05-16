'use client'

import { useDashboardContext } from '@/providers/dashboard-provider'
import type { Preview } from '@chatly/types/preview'
import { Skeleton } from './ui/skeleton'

interface ConversationPreviewSubtitleProps {
  preview: Preview
}

export default function ConversationPreviewSubtitle({
  preview,
}: ConversationPreviewSubtitleProps) {
  const { previewsLoading } = useDashboardContext()
  const isLoading = previewsLoading

  if (isLoading) return <Skeleton className='h-4 w-24 rounded-md' />

  const text = preview
    ? `${preview.isOwnMsg ? 'You: ' : ''}${preview.text}`
    : 'No messages yet'

  return <p className='text-muted-foreground truncate text-xs'>{text}</p>
}

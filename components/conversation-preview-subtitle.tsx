'use client'

import { useDashboardContext } from '@/providers/dashboard-provider'
import { Skeleton } from './ui/skeleton'
import type { Preview } from '@/types/use-previews'

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

  return <p className='text-xs text-muted-foreground truncate'>{text}</p>
}

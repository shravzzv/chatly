'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import ConversationPreview from './conversation-preview'
import ConversationPreviewSkeleton from './skeletons/conversation-preview-skeleton'
import { useDashboardContext } from '@/providers/dashboard-provider'

export default function ConversationsList() {
  const { filteredProfiles, profilesLoading, searchQuery } =
    useDashboardContext()

  const isLoading = profilesLoading
  const isEmpty = filteredProfiles.length === 0

  if (isLoading) {
    return (
      <div className='space-y-2 overflow-y-hidden p-4'>
        {Array.from({ length: 12 }).map((_, i) => (
          <ConversationPreviewSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-4 text-center'>
        <p className='text-muted-foreground'>
          {searchQuery ? 'No profiles found' : 'No profiles available'}
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className='flex flex-1 flex-col overflow-y-auto px-2'>
      {filteredProfiles.map((profile) => (
        <ConversationPreview key={profile.id} profile={profile} />
      ))}
    </ScrollArea>
  )
}

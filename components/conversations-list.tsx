import { ScrollArea } from '@/components/ui/scroll-area'
import { Profile } from '@/types/profile'
import { Message } from '@/types/message'
import ConversationPreview from './conversation-preview'
import ConversationPreviewSkeleton from './skeletons/conversation-preview-skeleton'

interface ConversationsListProps {
  selectedProfile: Profile | null
  filteredProfiles: Profile[]
  profilesLoading: boolean
  lastMessages: Record<string, Message | null>
  lastMessagesLoading: boolean
  searchQuery: string
  setSelectedProfileId: (profileId: string) => void
  closeProfileSelectDialog: () => void
}

export default function ConversationsList({
  selectedProfile,
  filteredProfiles,
  profilesLoading,
  lastMessages,
  lastMessagesLoading,
  searchQuery,
  setSelectedProfileId,
  closeProfileSelectDialog,
}: ConversationsListProps) {
  const isLoading = profilesLoading
  const isEmpty = filteredProfiles.length === 0

  if (isLoading) {
    return (
      <div className='space-y-2 p-4 overflow-y-hidden'>
        {Array.from({ length: 12 }).map((_, i) => (
          <ConversationPreviewSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center p-4'>
        <p className='text-muted-foreground'>
          {searchQuery ? 'No profiles found' : 'No profiles available'}
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className='flex-1 overflow-y-auto px-2 flex flex-col'>
      {filteredProfiles.map((profile) => (
        <ConversationPreview
          key={profile.id}
          profile={profile}
          selectedProfile={selectedProfile}
          setSelectedProfileId={setSelectedProfileId}
          lastMessages={lastMessages}
          lastMessagesLoading={lastMessagesLoading}
          closeProfileSelectDialog={closeProfileSelectDialog}
        />
      ))}
    </ScrollArea>
  )
}

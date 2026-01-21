'use client'

import { Button } from '@/components/ui/button'
import { getDisplayName } from '@/lib/dashboard'
import ProfileAvatar from '@/components/profile-avatar'
import { Profile } from '@/types/profile'
import { Message } from '@/types/message'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import ConversationPreviewSubtitle from './conversation-preview-subtitle'

interface ConversationPreviewProps {
  profile: Profile
  selectedProfile: Profile | null
  lastMessages: Record<string, Message | null>
  lastMessagesLoading: boolean
  setSelectedProfileId: (profileId: string) => void
  setIsProfileSelectDialogOpen?: (value: boolean) => void
}

export default function ConversationPreview({
  profile,
  selectedProfile,
  lastMessages,
  lastMessagesLoading,
  setSelectedProfileId,
  setIsProfileSelectDialogOpen,
}: ConversationPreviewProps) {
  const currentUser = useChatlyStore((state) => state.user)

  const handleClick = () => {
    setSelectedProfileId(profile.user_id)
    if (setIsProfileSelectDialogOpen) setIsProfileSelectDialogOpen(false)
  }

  return (
    <Button
      variant='ghost'
      size='lg'
      className={`w-full justify-start gap-3 px-4 py-8 rounded-xl hover:bg-muted transition text-left cursor-pointer ${selectedProfile?.id === profile.id ? 'bg-muted' : ''}`}
      onClick={handleClick}
    >
      <ProfileAvatar profile={profile} />

      <div className='flex flex-col text-left overflow-hidden min-w-0'>
        <p className='font-medium truncate'>
          {getDisplayName(profile)}
          {profile.user_id === currentUser?.id && ' (You)'}
        </p>

        <ConversationPreviewSubtitle
          isLoading={lastMessagesLoading}
          message={lastMessages[profile.user_id]?.text}
          isOwnMessage={
            lastMessages[profile.user_id]?.sender_id === currentUser?.id
          }
        />
      </div>
    </Button>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { getDisplayName } from '@/lib/dashboard'
import ProfileAvatar from '@/components/profile-avatar'
import { Profile } from '@/types/profile'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import ConversationPreviewSubtitle from './conversation-preview-subtitle'
import { useDashboardContext } from '@/providers/dashboard-provider'

interface ConversationPreviewProps {
  profile: Profile
}

export default function ConversationPreview({
  profile,
}: ConversationPreviewProps) {
  const {
    previews,
    selectedProfile,
    setSelectedProfileId,
    closeProfileSelectDialog,
  } = useDashboardContext()

  const currentUser = useChatlyStore((state) => state.user)

  const handleClick = () => {
    setSelectedProfileId(profile.user_id)
    closeProfileSelectDialog()
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

        <ConversationPreviewSubtitle preview={previews[profile.user_id]} />
      </div>
    </Button>
  )
}

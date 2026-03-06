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
      className={`hover:bg-muted w-full cursor-pointer justify-start gap-3 rounded-xl px-4 py-8 text-left transition ${selectedProfile?.id === profile.id ? 'bg-muted' : ''}`}
      onClick={handleClick}
    >
      <ProfileAvatar profile={profile} />

      <div className='flex min-w-0 flex-col overflow-hidden text-left'>
        <p className='truncate font-medium'>
          {getDisplayName(profile)}
          {profile.user_id === currentUser?.id && ' (You)'}
        </p>

        <ConversationPreviewSubtitle preview={previews[profile.user_id]} />
      </div>
    </Button>
  )
}

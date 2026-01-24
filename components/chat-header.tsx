'use client'

import { ArrowLeft } from 'lucide-react'
import { getDisplayName } from '@/lib/dashboard'
import ProfileAvatar from '@/components/profile-avatar'
import { Profile } from '@/types/profile'
import { useIsMobile } from '@/hooks/use-mobile'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { Button } from './ui/button'

interface ChatHeaderProps {
  selectedProfile: Profile
  closeChatPanel: () => void
}

export default function ChatHeader({
  selectedProfile,
  closeChatPanel,
}: ChatHeaderProps) {
  const isMobileView = useIsMobile()
  const currentUser = useChatlyStore((state) => state.user)

  return (
    <header className='flex items-center gap-3 p-4 border-b'>
      {isMobileView && (
        <Button
          size='icon'
          variant='ghost'
          className='cursor-pointer'
          onClick={closeChatPanel}
        >
          <ArrowLeft className='w-5 h-5' />
        </Button>
      )}

      <ProfileAvatar profile={selectedProfile} height={10} width={10} />

      <div>
        <p className='font-semibold truncate'>
          {getDisplayName(selectedProfile)}
          {selectedProfile.user_id === currentUser?.id && ' (You)'}
        </p>

        {selectedProfile.username && (
          <p className='text-xs text-muted-foreground truncate'>
            @{selectedProfile.username}
          </p>
        )}
      </div>
    </header>
  )
}

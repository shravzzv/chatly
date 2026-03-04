'use client'

import { ArrowLeft } from 'lucide-react'
import { getDisplayName } from '@/lib/dashboard'
import ProfileAvatar from '@/components/profile-avatar'
import { Profile } from '@/types/profile'
import { useIsMobile } from '@/hooks/use-mobile'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { Button } from './ui/button'
import { useDashboardContext } from '@/providers/dashboard-provider'

interface ChatHeaderProps {
  selectedProfile: Profile
}

export default function ChatHeader({ selectedProfile }: ChatHeaderProps) {
  const { closeChatPanel } = useDashboardContext()
  const isMobileView = useIsMobile()
  const currentUser = useChatlyStore((state) => state.user)

  return (
    <header className='flex items-center gap-3 border-b p-4'>
      {isMobileView && (
        <Button
          size='icon'
          variant='ghost'
          className='cursor-pointer'
          onClick={closeChatPanel}
        >
          <ArrowLeft className='h-5 w-5' />
        </Button>
      )}

      <ProfileAvatar profile={selectedProfile} height={10} width={10} />

      <div>
        <p className='truncate font-semibold'>
          {getDisplayName(selectedProfile)}
          {selectedProfile.user_id === currentUser?.id && ' (You)'}
        </p>

        {selectedProfile.username && (
          <p className='text-muted-foreground truncate text-xs'>
            @{selectedProfile.username}
          </p>
        )}
      </div>
    </header>
  )
}

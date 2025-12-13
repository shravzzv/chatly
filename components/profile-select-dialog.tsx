import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { ScrollArea } from './ui/scroll-area'
import { Skeleton } from './ui/skeleton'
import { Profile } from '@/types/profile'
import { Button } from './ui/button'
import { getDisplayName } from '@/lib/dashboard'
import { User } from '@supabase/supabase-js'
import ProfileAvatar from './profile-avatar'

interface ProfileSelectDialogProps {
  currentUser: User
  searchQuery: string
  profilesLoading: boolean
  filteredProfiles: Profile[]
  isProfileSelectDialogOpen: boolean
  setSearchQuery: (query: string) => void
  setSelectedProfile: (profile: Profile) => void
  setIsProfileSelectDialogOpen: (value: boolean) => void
}

export default function ProfileSelectDialog({
  searchQuery,
  currentUser,
  setSearchQuery,
  profilesLoading,
  filteredProfiles,
  setSelectedProfile,
  isProfileSelectDialogOpen,
  setIsProfileSelectDialogOpen,
}: ProfileSelectDialogProps) {
  return (
    <Dialog
      open={isProfileSelectDialogOpen}
      onOpenChange={setIsProfileSelectDialogOpen}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Select a contact to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className='mt-4'>
          <InputGroup className='mb-4'>
            <InputGroupInput
              type='text'
              placeholder='Search contacts...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
            <InputGroupAddon>
              <Search className='w-4 h-4' />
            </InputGroupAddon>
          </InputGroup>

          <ScrollArea className='h-100 pr-4'>
            {profilesLoading ? (
              <div className='space-y-3'>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-3 p-3 rounded-lg'
                  >
                    <Skeleton className='h-10 w-10 rounded-full shrink-0' />
                    <div className='flex flex-col gap-2 flex-1'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-3 w-1/2' />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-center p-8'>
                <p className='text-muted-foreground'>
                  {searchQuery ? 'No contacts found' : 'No contacts available'}
                </p>
              </div>
            ) : (
              <div className='space-y-1'>
                {filteredProfiles.map((profile) => (
                  <Button
                    key={profile.id}
                    variant='ghost'
                    className='w-full justify-start gap-3 h-auto py-3 px-3 rounded-lg hover:bg-muted cursor-pointer'
                    onClick={() => {
                      setSelectedProfile(profile)
                      setIsProfileSelectDialogOpen(false)
                    }}
                  >
                    <ProfileAvatar profile={profile} />

                    <div className='flex flex-col text-left overflow-hidden min-w-0 flex-1'>
                      <span className='font-medium truncate'>
                        {getDisplayName(profile)}
                        {profile.user_id === currentUser.id && ' (You)'}
                      </span>
                      {profile.username && (
                        <span className='text-xs text-muted-foreground truncate'>
                          @{profile.username}
                        </span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

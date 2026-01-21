import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { Profile } from '@/types/profile'
import { Message } from '@/types/message'
import ConversationsList from './conversations-list'

interface ConversationSelectDialogProps {
  searchQuery: string
  profilesLoading: boolean
  filteredProfiles: Profile[]
  isProfileSelectDialogOpen: boolean
  setSearchQuery: (query: string) => void
  setSelectedProfileId: (id: string) => void
  setIsProfileSelectDialogOpen: (value: boolean) => void
  selectedProfile: Profile | null
  lastMessages: Record<string, Message | null>
  lastMessagesLoading: boolean
}

export default function ConversationSelectDialog({
  searchQuery,
  setSearchQuery,
  profilesLoading,
  filteredProfiles,
  setSelectedProfileId,
  isProfileSelectDialogOpen,
  setIsProfileSelectDialogOpen,
  selectedProfile,
  lastMessages,
  lastMessagesLoading,
}: ConversationSelectDialogProps) {
  return (
    <Dialog
      open={isProfileSelectDialogOpen}
      onOpenChange={setIsProfileSelectDialogOpen}
    >
      <DialogContent className='max-h-[60vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Select a contact to start a conversation
          </DialogDescription>
        </DialogHeader>

        <InputGroup>
          <InputGroupInput
            type='search'
            placeholder='name or username...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
          <InputGroupAddon>
            <Search className='w-4 h-4' />
          </InputGroupAddon>
        </InputGroup>

        <ConversationsList
          filteredProfiles={filteredProfiles}
          lastMessages={lastMessages}
          lastMessagesLoading={lastMessagesLoading}
          profilesLoading={profilesLoading}
          searchQuery={searchQuery}
          selectedProfile={selectedProfile}
          setSelectedProfileId={setSelectedProfileId}
          setIsProfileSelectDialogOpen={setIsProfileSelectDialogOpen}
        />
      </DialogContent>
    </Dialog>
  )
}

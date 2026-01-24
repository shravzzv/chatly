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
  selectedProfile: Profile | null
  lastMessages: Record<string, Message | null>
  lastMessagesLoading: boolean
  setSelectedProfileId: (id: string) => void
  setSearchQuery: (query: string) => void
  openProfileSelectDialog: () => void
  closeProfileSelectDialog: () => void
}

export default function ConversationSelectDialog({
  searchQuery,
  profilesLoading,
  filteredProfiles,
  isProfileSelectDialogOpen,
  selectedProfile,
  lastMessages,
  lastMessagesLoading,
  setSelectedProfileId,
  setSearchQuery,
  openProfileSelectDialog,
  closeProfileSelectDialog,
}: ConversationSelectDialogProps) {
  return (
    <Dialog
      open={isProfileSelectDialogOpen}
      onOpenChange={(open) =>
        open ? openProfileSelectDialog() : closeProfileSelectDialog()
      }
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
          closeProfileSelectDialog={closeProfileSelectDialog}
        />
      </DialogContent>
    </Dialog>
  )
}

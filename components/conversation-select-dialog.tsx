'use client'

import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import ConversationsList from './conversations-list'
import { useDashboardContext } from '@/providers/dashboard-provider'

export default function ConversationSelectDialog() {
  const {
    searchQuery,
    isProfileSelectDialogOpen,
    setSearchQuery,
    openProfileSelectDialog,
    closeProfileSelectDialog,
  } = useDashboardContext()

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

        <ConversationsList />
      </DialogContent>
    </Dialog>
  )
}

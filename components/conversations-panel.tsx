'use client'

import { Profile } from '@/types/profile'
import { Message } from '@/types/message'
import ConversationsPanelHeader from './conversations-panel-header'
import ConversationsList from './conversations-list'

interface ConversationsPanelProps {
  selectedProfile: Profile | null
  filteredProfiles: Profile[]
  profilesLoading: boolean
  lastMessages: Record<string, Message | null>
  lastMessagesLoading: boolean
  searchQuery: string
  setSearchQuery: (value: string) => void
  setSelectedProfileId: (profileId: string) => void
  openProfileSelectDialog: () => void
  closeProfileSelectDialog: () => void
}

export default function ConversationsPanel({
  selectedProfile,
  filteredProfiles,
  profilesLoading,
  lastMessages,
  lastMessagesLoading,
  searchQuery,
  setSearchQuery,
  setSelectedProfileId,
  openProfileSelectDialog,
  closeProfileSelectDialog,
}: ConversationsPanelProps) {
  return (
    <aside
      className={`flex flex-col h-full p-2 w-full md:w-80 shrink-0 border-r rounded-xl ${
        selectedProfile ? 'hidden md:flex' : 'flex'
      }`}
    >
      <ConversationsPanelHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openProfileSelectDialog={openProfileSelectDialog}
      />

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
    </aside>
  )
}

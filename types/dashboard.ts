import { useMessages } from '@/hooks/use-messages'
import type { Message } from '@/types/message'
import type { Profile } from '@/types/profile'
import type { Previews } from '@/types/use-previews'

export interface DashboardContextValue {
  // profiles
  profiles: Profile[]
  filteredProfiles: Profile[]
  profilesLoading: boolean

  // previews
  previews: Previews
  previewsLoading: boolean

  // messages
  messages: Message[]
  messagesLoading: boolean
  sendMessage: ReturnType<typeof useMessages>['sendMessage']
  editMessage: ReturnType<typeof useMessages>['editMessage']
  deleteMessage: ReturnType<typeof useMessages>['deleteMessage']

  // search
  searchQuery: string
  setSearchQuery: (q: string) => void

  // selection & UI
  selectedProfile: Profile | null
  selectedProfileId: string | null
  setSelectedProfileId: (id: string | null) => void

  isProfileSelectDialogOpen: boolean
  openProfileSelectDialog: () => void
  closeProfileSelectDialog: () => void
  closeChatPanel: () => void
}

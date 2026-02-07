import { useMessages } from '@/hooks/use-messages'
import type { Message } from '@/types/message'
import type { Profile } from '@/types/profile'
import type { Previews } from '@/types/use-previews'
import type { ChatlyPlan, UsageKind } from './plan'

export interface DashboardContextValue {
  // profiles
  readonly profiles: Profile[]
  readonly filteredProfiles: Profile[]
  readonly profilesLoading: boolean

  // previews
  readonly previews: Previews
  readonly previewsLoading: boolean

  // messages
  readonly messages: Message[]
  readonly messagesLoading: boolean
  sendMessage: ReturnType<typeof useMessages>['sendMessage']
  editMessage: ReturnType<typeof useMessages>['editMessage']
  deleteMessage: ReturnType<typeof useMessages>['deleteMessage']

  // search
  readonly searchQuery: string
  setSearchQuery: (q: string) => void

  // selection & UI
  readonly selectedProfile: Profile | null
  readonly selectedProfileId: string | null
  setSelectedProfileId: (id: string | null) => void

  readonly isProfileSelectDialogOpen: boolean
  openProfileSelectDialog: () => void
  closeProfileSelectDialog: () => void
  closeChatPanel: () => void

  // usage
  readonly plan: ChatlyPlan
  readonly usageLoading: boolean
  readonly aiUsed: number
  readonly canUseAi: boolean
  readonly aiRemaining: number
  readonly mediaUsed: number
  readonly canUseMedia: boolean
  readonly mediaRemaining: number
  reflectUsageIncrement: (kind: UsageKind) => void

  // upgrade
  readonly upgradeReason: UsageKind | null
  openUpgradeAlertDialog: (reason: UsageKind) => void
  closeUpgradeAlertDialog: () => void
}

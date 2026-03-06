'use client'

import ConversationsPanelHeader from './conversations-panel-header'
import ConversationsList from './conversations-list'
import { useDashboardContext } from '@/providers/dashboard-provider'

export default function ConversationsPanel() {
  const { selectedProfile } = useDashboardContext()

  return (
    <aside
      className={`flex h-full w-full shrink-0 flex-col rounded-xl border-r p-2 md:w-80 ${
        selectedProfile ? 'hidden md:flex' : 'flex'
      }`}
    >
      <ConversationsPanelHeader />
      <ConversationsList />
    </aside>
  )
}

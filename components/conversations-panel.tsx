'use client'

import ConversationsPanelHeader from './conversations-panel-header'
import ConversationsList from './conversations-list'
import { useDashboardContext } from '@/providers/dashboard-provider'

export default function ConversationsPanel() {
  const { selectedProfile } = useDashboardContext()

  return (
    <aside
      className={`flex flex-col h-full p-2 w-full md:w-80 shrink-0 border-r rounded-xl ${
        selectedProfile ? 'hidden md:flex' : 'flex'
      }`}
    >
      <ConversationsPanelHeader />
      <ConversationsList />
    </aside>
  )
}

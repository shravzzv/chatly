'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCheckoutUrl } from '@/lib/get-checkout-url'
import { Billing, Plan } from '@/types/subscription'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import ChatPanel from '@/components/chat-panel'
import ConversationsPanel from '@/components/conversations-panel'
import ConversationSelectDialog from '@/components/conversation-select-dialog'
import { useProfiles } from '@/hooks/use-profiles'
import { useMessages } from '@/hooks/use-messages'

export default function Page() {
  // Navigation and URL state
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const billing = searchParams.get('billing')

  // Page owned UI state
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    () => searchParams.get('senderId'),
  )
  const [isProfileSelectDialogOpen, setIsProfileSelectDialogOpen] =
    useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Auth state
  const currentUser = useChatlyStore((state) => state.user)

  // Data hooks, business logic
  const {
    profiles,
    filteredProfiles,
    loading: profilesLoading,
  } = useProfiles(searchQuery)

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    deleteMessage,
    editMessage,
    lastMessages,
    lastMessagesLoading,
  } = useMessages(selectedProfileId)

  // Derived state
  const selectedProfile = useMemo(
    () => profiles.find((p) => p.user_id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  )

  /**
   * Navigate the user to the checkout page when they've signed up through
   * the pricing page to ensure continuity.
   */
  useEffect(() => {
    if (!currentUser || !plan || !billing) return

    const checkoutUrl = getCheckoutUrl(
      plan as Plan,
      billing as Billing,
      currentUser,
    )

    if (checkoutUrl) router.replace(checkoutUrl)
  }, [currentUser, plan, billing, router])

  const closeChatPanel = () => {
    setSelectedProfileId(null)
  }

  const closeProfileSelectDialog = () => {
    setIsProfileSelectDialogOpen(false)
  }

  const openProfileSelectDialog = () => {
    setIsProfileSelectDialogOpen(true)
  }

  return (
    <div className='h-[calc(100vh-1rem)] rounded-xl flex'>
      <ConversationsPanel
        filteredProfiles={filteredProfiles}
        profilesLoading={profilesLoading}
        lastMessages={lastMessages}
        lastMessagesLoading={lastMessagesLoading}
        searchQuery={searchQuery}
        selectedProfile={selectedProfile}
        openProfileSelectDialog={openProfileSelectDialog}
        closeProfileSelectDialog={closeProfileSelectDialog}
        setSearchQuery={setSearchQuery}
        setSelectedProfileId={setSelectedProfileId}
      />

      <ChatPanel
        messages={messages}
        messagesLoading={messagesLoading}
        selectedProfile={selectedProfile}
        closeChatPanel={closeChatPanel}
        sendMessage={sendMessage}
        deleteMessage={deleteMessage}
        editMessage={editMessage}
        openProfileSelectDialog={openProfileSelectDialog}
      />

      <ConversationSelectDialog
        searchQuery={searchQuery}
        profilesLoading={profilesLoading}
        filteredProfiles={filteredProfiles}
        lastMessages={lastMessages}
        selectedProfile={selectedProfile}
        lastMessagesLoading={lastMessagesLoading}
        isProfileSelectDialogOpen={isProfileSelectDialogOpen}
        openProfileSelectDialog={openProfileSelectDialog}
        closeProfileSelectDialog={closeProfileSelectDialog}
        setSearchQuery={setSearchQuery}
        setSelectedProfileId={setSelectedProfileId}
      />
    </div>
  )
}

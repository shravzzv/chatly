'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCheckoutUrl } from '@/lib/get-checkout-url'
import type { Billing, Plan } from '@/types/subscription'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import ChatPanel from '@/components/chat-panel'
import ConversationsPanel from '@/components/conversations-panel'
import ConversationSelectDialog from '@/components/conversation-select-dialog'
import { DashboardProvider } from '@/providers/dashboard-provider'

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const billing = searchParams.get('billing')
  const currentUser = useChatlyStore((state) => state.user)

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

  return (
    <div className='h-[calc(100vh-1rem)] rounded-xl flex'>
      <DashboardProvider>
        <ConversationsPanel />
        <ChatPanel />
        <ConversationSelectDialog />
      </DashboardProvider>
    </div>
  )
}

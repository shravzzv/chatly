import DemotedPlanAlert from '@/components/demoted-plan-alert'
import FreePlanCard from '@/components/free-plan-card'
import { Screen } from '@/components/ui/screen'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import type { Subscription } from '@chatly/types/subscription'

export const mockExpiredSubscription: Subscription = {
  id: '6e2b83a4-712c-4f9e-b9ad-d48e2354a112',
  user_id: 'usr_01jk5m7pqz89wxy123456789ab',
  ls_subscription_id: 'sub_4921053',
  ls_customer_id: 'cus_817263',
  plan: 'pro',
  billing: 'yearly',
  status: 'expired',
  renews_at: '2027-05-20T14:54:55Z',
  ends_at: '2026-05-20T14:54:55Z',
  created_at: '2026-05-20T14:54:55Z',
  updated_at: '2026-05-20T14:54:55Z',
}

export default function Page() {
  return (
    <Screen className='mx-auto w-full max-w-xl gap-4'>
      <DemotedPlanAlert subscription={mockExpiredSubscription} />
      <FreePlanCard hideAction />

      <Separator />

      <Text className='text-xs text-muted-foreground'>
        Billing and payments are managed securely.
      </Text>
    </Screen>
  )
}

import DemotedPlanAlert from '@/components/demoted-plan-alert'
import FreePlanCard from '@/components/free-plan-card'
import MultipleSubscriptionsAlert from '@/components/multiple-subscriptions-alert'
import PaidPlanCard from '@/components/paid-plan-card'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/providers/auth-provider'
import {
  getEffectiveSubscription,
  getLastEndedPaidSubscription,
  isEffectiveSubscription,
} from '@chatly/lib/billing'
import type { Subscription } from '@chatly/types/subscription'
import { useEffect, useState } from 'react'
import { toast } from 'sonner-native'
import CurrentPlanSkeleton from './skeletons/current-plan-skeleton'

export default function CurrentPlan() {
  const [loading, setLoading] = useState(true)
  const [subs, setSubs] = useState<Subscription[]>([])
  const { userId } = useAuthContext()

  useEffect(() => {
    const getSubscriptions = async (): Promise<Subscription[]> => {
      if (!supabase) throw Error('Supabase client absent')

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      return data
    }

    const fetchSubs = async () => {
      try {
        const data = await getSubscriptions()
        setSubs(data)
      } catch (error) {
        console.error(error)
        toast.error('Failed to fetch subscription')
      } finally {
        setLoading(false)
      }
    }

    fetchSubs()
  }, [userId])

  if (loading) return <CurrentPlanSkeleton />

  const effectiveSub = getEffectiveSubscription(subs)
  const demotedSub = effectiveSub ? null : getLastEndedPaidSubscription(subs)
  const hasOtherEligibleSubs = subs.filter(isEffectiveSubscription).length > 1

  if (demotedSub)
    return (
      <>
        <DemotedPlanAlert subscription={demotedSub} />
        <FreePlanCard hideAction />
      </>
    )

  if (!effectiveSub) return <FreePlanCard />

  return (
    <>
      <PaidPlanCard subscription={effectiveSub} />
      {hasOtherEligibleSubs && <MultipleSubscriptionsAlert />}
    </>
  )
}

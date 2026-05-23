'use client'

import { getSubscriptions } from '@/app/actions'
import {
  getEffectiveSubscription,
  getLastEndedPaidSubscription,
  isEffectiveSubscription,
} from '@chatly/lib/billing'
import type { Subscription } from '@chatly/types/subscription'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DemotedPlanAlert from './demoted-plan-alert'
import FreePlanCard from './free-plan-card'
import MultipleSubscriptionsAlert from './multiple-subscriptions-alert'
import PaidPlanCard from './paid-plan-card'
import CurrentPlanCardSkeleton from './skeletons/current-plan-card-skeleton'

export default function CurrentPlanSection() {
  const [loading, setLoading] = useState(true)
  const [subs, setSubs] = useState<Subscription[]>([])

  useEffect(() => {
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
  }, [])

  if (loading) return <CurrentPlanCardSkeleton />

  const effectiveSub = getEffectiveSubscription(subs)
  const demotedSub = effectiveSub ? null : getLastEndedPaidSubscription(subs)
  const hasOtherEligibleSubs = subs.filter(isEffectiveSubscription).length > 1

  if (demotedSub)
    return (
      <section className='space-y-4'>
        <DemotedPlanAlert subscription={demotedSub} />
        <FreePlanCard hideAction />
      </section>
    )

  if (!effectiveSub)
    return (
      <section>
        <FreePlanCard />
      </section>
    )

  return (
    <section className='space-y-4'>
      <PaidPlanCard subscription={effectiveSub} />
      {hasOtherEligibleSubs && <MultipleSubscriptionsAlert />}
    </section>
  )
}

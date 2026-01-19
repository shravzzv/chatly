'use client'

import { useEffect, useState } from 'react'
import { Subscription } from '@/types/subscription'
import { getSubscriptions } from '@/app/actions'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircleIcon } from 'lucide-react'
import CurrentPlanCardSkeleton from './skeletons/current-plan-card-skeleton'
import FreePlanCard from './free-plan-card'
import {
  getEffectiveSubscription,
  getLastEndedPaidSubscription,
  isEffectiveSubscription,
} from '@/lib/billing'
import PaidPlanCard from './paid-plan-card'
import Link from 'next/link'
import { LS_CUSTOMER_PORTAL_URL } from '@/data/constants'
import DemotedPlanAlert from './demoted-plan-alert'

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

      {hasOtherEligibleSubs && (
        <Alert>
          <AlertCircleIcon />
          <AlertTitle>You have multiple subscriptions</AlertTitle>
          <AlertDescription>
            <p>
              Only the most effective subscription is used. Please cancel the
              others in the{' '}
              <Link href={LS_CUSTOMER_PORTAL_URL} className='underline'>
                billing portal
              </Link>
              .
            </p>
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}

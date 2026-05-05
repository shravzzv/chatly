'use client'

import { PLAN_LIMITS } from '@/data/plans'
import { getUsageResetTime } from '@/lib/date'
import { usePrivateContext } from '@/providers/private-provider'
import { Skeleton } from './ui/skeleton'
import { UsageMeter } from './usage-meter'

export function UsageProgress() {
  const { plan, aiUsed, mediaUsed, usageLoading } = usePrivateContext()

  if (usageLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 2 }, (_, idx) => (
          <div className='space-y-2' key={idx}>
            <div className='flex justify-between'>
              <Skeleton className='h-6 w-1/2' />
              <Skeleton className='h-6 w-1/6' />
            </div>

            <Skeleton className='h-2 w-full' />
          </div>
        ))}
      </div>
    )
  }

  if (plan === 'free') return null

  return (
    <div className='space-y-3'>
      <p className='text-sm font-medium'>Usage today</p>

      <UsageMeter
        label='Media attachments'
        used={mediaUsed}
        limit={PLAN_LIMITS[plan].media}
      />

      <UsageMeter
        label='AI enhancements'
        used={aiUsed}
        limit={PLAN_LIMITS[plan].ai}
      />

      <p className='text-muted-foreground text-xs'>
        Usage resets every day at {getUsageResetTime()} your time.
      </p>
    </div>
  )
}

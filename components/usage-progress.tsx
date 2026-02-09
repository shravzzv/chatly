'use client'

import { PLAN_LIMITS } from '@/data/plans'
import { UsageMeter } from './usage-meter'
import { useUsage } from '@/hooks/use-usage'
import { Skeleton } from './ui/skeleton'
import { getUsageResetTime } from '@/lib/date'

export function UsageProgress() {
  /**
   * Intentionally duplicating these readonly state variables provisionally.
   *
   * These are created in the app/dashboard/page.tsx as well.
   * The dashboard and plan pages are never together in the html.
   *
   * A potent solution would be to lift the state up by providing this state
   * in the private pages layout using context.
   */
  const { plan, aiUsed, mediaUsed, loading } = useUsage()

  if (loading) {
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

      <p className='text-xs text-muted-foreground'>
        Usage resets every day at {getUsageResetTime()} your time.
      </p>
    </div>
  )
}

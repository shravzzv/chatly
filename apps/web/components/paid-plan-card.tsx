import { LS_CUSTOMER_PORTAL_URL } from '@/data/constants'
import {
  getStatusBadgeClass,
  getSubscriptionTimeline,
  PAID_PLAN_HIGHLIGHTS,
} from '@/lib/billing'
import { formatRelativeDate } from '@/lib/date'
import type { Subscription } from '@chatly/types/subscription'
import Link from 'next/link'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { UsageProgress } from './usage-progress'

interface PaidPlanCardProps {
  subscription: Subscription
}

export default function PaidPlanCard({ subscription }: PaidPlanCardProps) {
  const highlights = PAID_PLAN_HIGHLIGHTS[subscription.plan]
  const timeline = getSubscriptionTimeline(subscription)

  return (
    <Card>
      <CardHeader className='space-y-1 md:space-y-0'>
        <CardTitle className='flex flex-col items-start gap-1 text-xl font-medium capitalize sm:flex-row sm:items-center sm:gap-2'>
          {subscription.plan}
          <Badge className={getStatusBadgeClass(subscription.status)}>
            {subscription.status.replace('_', ' ')}
          </Badge>
        </CardTitle>

        <CardDescription>Billed {subscription.billing}</CardDescription>

        <CardAction>
          <Button asChild variant='secondary'>
            <Link href={LS_CUSTOMER_PORTAL_URL}>Manage billing</Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='space-y-4'>
        <ul className='text-muted-foreground list-disc space-y-1 pl-4 text-sm'>
          {highlights.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        {timeline && (
          <p className='text-muted-foreground flex items-center gap-1 text-sm'>
            {timeline.label} {formatRelativeDate(timeline.date)} (
            {new Date(timeline.date).toLocaleDateString()}).
          </p>
        )}

        <UsageProgress />
      </CardContent>
    </Card>
  )
}

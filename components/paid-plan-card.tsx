import Link from 'next/link'
import { Button } from './ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Subscription } from '@/types/subscription'
import { LS_CUSTOMER_PORTAL_URL } from '@/data/constants'
import { Badge } from './ui/badge'
import {
  getStatusBadgeClass,
  getSubscriptionTimeline,
  PAID_PLAN_HIGHLIGHTS,
} from '@/lib/billing'
import { formatRelativeDate } from '@/lib/date'

interface PaidPlanCardProps {
  subscription: Subscription
}

export default function PaidPlanCard({ subscription }: PaidPlanCardProps) {
  const highlights = PAID_PLAN_HIGHLIGHTS[subscription.plan]
  const timeline = getSubscriptionTimeline(subscription)

  return (
    <Card>
      <CardHeader className='space-y-1 md:space-y-0'>
        <CardTitle className='text-xl font-medium capitalize flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2'>
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
        <ul className='list-disc pl-4 text-sm text-muted-foreground space-y-1'>
          {highlights.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        {timeline && (
          <p className='flex items-center gap-1 text-sm text-muted-foreground'>
            {timeline.label} {formatRelativeDate(timeline.date)} (
            {new Date(timeline.date).toLocaleDateString()})
          </p>
        )}
      </CardContent>
    </Card>
  )
}

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { type Subscription } from '@/types/subscription'
import { AlertCircleIcon } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import { LS_CUSTOMER_PORTAL_URL } from '@/data/constants'
import { Badge } from './ui/badge'
import { getStatusBadgeClass } from '@/lib/billing'

interface DemotedPlanAlertProps {
  subscription: Subscription
}

export default function DemotedPlanAlert({
  subscription,
}: DemotedPlanAlertProps) {
  return (
    <Alert>
      <AlertCircleIcon />
      <AlertTitle>Your paid plan has ended</AlertTitle>
      <AlertDescription className='space-y-1'>
        <p>
          <strong className='capitalize'>{subscription.plan}</strong> plan is
          <Badge className={`ml-1 ${getStatusBadgeClass(subscription.status)}`}>
            {subscription.status.replace('_', ' ')}
          </Badge>
          , so you&apos;re currently on the <strong>Free</strong> plan.
        </p>

        {subscription.ends_at && (
          <p className='text-xs text-muted-foreground'>
            {subscription.status === 'expired' ? 'Expired' : 'Cancelled'} on{' '}
            {new Date(subscription.ends_at).toLocaleDateString()}.
          </p>
        )}

        <Button asChild size='sm'>
          <Link href={LS_CUSTOMER_PORTAL_URL}>Renew</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}

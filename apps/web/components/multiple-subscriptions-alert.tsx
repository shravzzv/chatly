import { LS_CUSTOMER_PORTAL_URL } from '@chatly/lib/data'
import { AlertCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

export default function MultipleSubscriptionsAlert() {
  return (
    <Alert>
      <AlertCircleIcon />
      <AlertTitle>You have multiple subscriptions</AlertTitle>
      <AlertDescription>
        <p>
          Only the most effective subscription is used. Please cancel the others
          in the{' '}
          <Link href={LS_CUSTOMER_PORTAL_URL} className='underline'>
            billing portal
          </Link>
          .
        </p>
      </AlertDescription>
    </Alert>
  )
}

import { LS_CUSTOMER_PORTAL_URL } from '@chatly/lib/billing'
import { Link } from 'expo-router'
import { AlertCircleIcon } from 'lucide-react-native'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Text } from './ui/text'

export default function MultipleSubscriptionsAlert() {
  return (
    <Alert
      icon={AlertCircleIcon}
      iconClassName='text-amber-900 dark:text-amber-50 size-5 z-[999]'
      className='border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50'
    >
      <AlertTitle>You have multiple subscriptions</AlertTitle>
      <AlertDescription>
        <Text>
          Only the most effective subscription is used. Please cancel the others
          in the{' '}
          <Link href={LS_CUSTOMER_PORTAL_URL} className='underline'>
            billing portal
          </Link>
          .
        </Text>
      </AlertDescription>
    </Alert>
  )
}

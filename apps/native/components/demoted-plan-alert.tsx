import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LS_CUSTOMER_PORTAL_URL } from '@chatly/lib/billing'
import type { Subscription } from '@chatly/types/subscription'
import { Link } from 'expo-router'
import { AlertCircleIcon } from 'lucide-react-native'
import { View } from 'react-native'
import { Button } from './ui/button'
import { Text } from './ui/text'

interface DemotedPlanAlertProps {
  subscription: Subscription
}

export default function DemotedPlanAlert({
  subscription,
}: DemotedPlanAlertProps) {
  return (
    <Alert
      icon={AlertCircleIcon}
      iconClassName='text-amber-900 dark:text-amber-50 size-5 z-[999]'
      className='border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50'
    >
      <AlertTitle>You&apos;re currently on Free</AlertTitle>

      <AlertDescription>
        <View className='gap-3'>
          <Text>
            Your{' '}
            <Text className='font-bold capitalize'>{subscription.plan}</Text>{' '}
            subscription has{' '}
            <Text className='font-bold'>
              {subscription.status.replace('_', ' ')}
            </Text>
            . Premium features are no longer available, but your account and
            conversations are still here.
          </Text>

          {subscription.ends_at && (
            <Text>
              {subscription.status === 'expired' ? 'Expired' : 'Ended'} on{' '}
              {new Date(subscription.ends_at).toLocaleDateString()}.
            </Text>
          )}

          <Text>Renew anytime to restore premium features.</Text>

          <Link href={LS_CUSTOMER_PORTAL_URL} asChild>
            <Button size='sm' className='w-fit'>
              <Text>Renew</Text>
            </Button>
          </Link>
        </View>
      </AlertDescription>
    </Alert>
  )
}

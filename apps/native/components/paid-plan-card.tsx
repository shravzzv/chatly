import {
  getSubscriptionTimeline,
  LS_CUSTOMER_PORTAL_URL,
  PAID_PLAN_HIGHLIGHTS,
} from '@chatly/lib/billing'
import { formatRelativeDate } from '@chatly/lib/date'
import type { Subscription } from '@chatly/types/subscription'
import { Link } from 'expo-router'
import { View } from 'react-native'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Text } from './ui/text'
import { UsageProgress } from './usage-progress'

interface PaidPlanCardProps {
  subscription: Subscription
}

export default function PaidPlanCard({ subscription }: PaidPlanCardProps) {
  const highlights = PAID_PLAN_HIGHLIGHTS[subscription.plan]
  const timeline = getSubscriptionTimeline(subscription)

  return (
    <Card>
      <CardHeader className='flex-row items-start justify-between space-y-1 md:space-y-0'>
        <View className='flex-1 gap-2'>
          <CardTitle className='flex flex-col items-start gap-2 font-medium text-xl capitalize'>
            <Text className='font-medium text-lg capitalize'>
              {subscription.plan}
            </Text>

            <Badge
              variant={
                ['expired', 'cancelled'].includes(subscription.status)
                  ? 'destructive'
                  : 'default'
              }
            >
              <Text className='font-semibold capitalize'>
                {subscription.status.replace('_', ' ')}
              </Text>
            </Badge>
          </CardTitle>

          <CardDescription>Billed {subscription.billing}</CardDescription>
        </View>

        <Link href={LS_CUSTOMER_PORTAL_URL} asChild className='shrink-0'>
          <Button variant='secondary' size='sm' className='w-fit'>
            <Text>Manage billing</Text>
          </Button>
        </Link>
      </CardHeader>

      <CardContent className='gap-4'>
        <View className='gap-1'>
          {highlights.map((item, index) => (
            <View key={index} className='flex-row items-start'>
              <Text className='mr-2 text-sm text-muted-foreground'>
                {'\u2022'}
              </Text>

              <Text className='flex-1 text-sm text-muted-foreground'>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {timeline && (
          <Text className='flex items-center gap-1 text-sm text-muted-foreground'>
            {timeline.label} {formatRelativeDate(timeline.date)} (
            {new Date(timeline.date).toLocaleDateString()}).
          </Text>
        )}

        <UsageProgress />
      </CardContent>
    </Card>
  )
}

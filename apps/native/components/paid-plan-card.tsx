import {
  getSubscriptionTimeline,
  LS_CUSTOMER_PORTAL_URL,
  PAID_PLAN_HIGHLIGHTS,
} from '@chatly/lib/billing'
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

function pluralize(count: number, singular: string) {
  return count === 1 ? singular : `${singular}s`
}

const formatRelativeDate = (date: string) => {
  const target = new Date(date)
  const now = new Date()

  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return null
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays < 7) {
    return `in ${diffDays} ${pluralize(diffDays, 'day')}`
  }
  if (diffDays < 30) {
    const weeks = Math.round(diffDays / 7)
    return `in ${weeks} ${pluralize(weeks, 'week')}`
  }
  const months = Math.round(diffDays / 30)
  return `in ${months} ${pluralize(months, 'month')}`
}

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
            <Text className='font-medium capitalize'>{subscription.plan}</Text>

            <Badge className='border-green-600/20 bg-green-500/10 text-green-700'>
              <Text className='capitalize text-card-foreground'>
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
        <View className='space-y-1'>
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

        {/* <UsageProgress /> */}
      </CardContent>
    </Card>
  )
}

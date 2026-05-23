import { usePrivateContext } from '@/providers/private-provider'
import { PLAN_LIMITS } from '@chatly/lib/billing'
import { getUsageResetTime } from '@chatly/lib/date'
import { View } from 'react-native'
import UsageProgressSkeleton from './skeletons/usage-progress-skeleton'
import { Text } from './ui/text'
import { UsageMeter } from './usage-meter'

export function UsageProgress() {
  const { plan, aiUsed, mediaUsed, usageLoading } = usePrivateContext()

  if (usageLoading) return <UsageProgressSkeleton />
  if (plan === 'free') return null

  return (
    <View className='gap-3'>
      <Text className='font-medium text-sm'>Usage today</Text>

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

      <Text className='text-xs text-muted-foreground'>
        Usage resets every day at {getUsageResetTime()} your time.
      </Text>
    </View>
  )
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { View } from 'react-native'
import { Skeleton } from '../ui/skeleton'
import UsageProgressSkeleton from './usage-progress-skeleton'

export default function CurrentPlanSkeleton() {
  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <View className='gap-2'>
          <CardTitle>
            <Skeleton className='h-6 w-40' />
          </CardTitle>

          <CardDescription>
            <Skeleton className='h-4 w-16' />
          </CardDescription>
        </View>

        <Skeleton className='h-9 w-20 rounded-md' />
      </CardHeader>

      <CardContent className='gap-3'>
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-4 w-40' />
        <Skeleton className='h-4 w-36' />
        <Skeleton className='h-4 w-32' />

        <View className='mt-4'>
          <UsageProgressSkeleton />
        </View>
      </CardContent>
    </Card>
  )
}

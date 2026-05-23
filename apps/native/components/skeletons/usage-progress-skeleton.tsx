import { View } from 'react-native'
import { Skeleton } from '../ui/skeleton'

export default function UsageProgressSkeleton() {
  return (
    <View className='gap-3'>
      {Array.from({ length: 2 }, (_, idx) => (
        <View className='gap-2' key={idx}>
          <View className='flex-row justify-between'>
            <Skeleton className='h-6 w-1/2' />
            <Skeleton className='h-6 w-1/6' />
          </View>

          <Skeleton className='h-2 w-full' />
        </View>
      ))}
    </View>
  )
}

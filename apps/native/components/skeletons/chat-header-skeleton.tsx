import { View } from 'react-native'
import { Skeleton } from '../ui/skeleton'

export default function ChatHeaderSkeleton() {
  return (
    <View className='max-w-2xl flex-row items-center gap-2'>
      <Skeleton className='size-10 shrink-0 rounded-full' />

      <View className='flex-1 gap-2'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-3 w-32' />
      </View>
    </View>
  )
}

import { View } from 'react-native'
import { Skeleton } from '../ui/skeleton'

export default function AudioAttachmentSkeleton() {
  return (
    <View className='cursor-progress flex-row items-center gap-2 rounded-full border border-border p-1 pr-2'>
      <Skeleton className='size-10 rounded-full sm:size-9' />
      <Skeleton className='h-4 w-[100px] rounded-sm' />
      <Skeleton className='h-2 w-[60px] rounded-sm' />
    </View>
  )
}

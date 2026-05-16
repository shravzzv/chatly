import { Skeleton } from '@/components/ui/skeleton'
import { View } from 'react-native'

export default function FileAttachmentSkeleton() {
  return (
    <View className='w-full max-w-xs cursor-progress flex-row items-center gap-2 rounded-2xl p-2 debug'>
      {/* File icon placeholder */}
      <Skeleton className='h-10 w-10 shrink-0 rounded-md' />

      <View className='flex-1 gap-1'>
        {/* File name */}
        <Skeleton className='h-4 w-full' />

        {/* Metadata line */}
        <Skeleton className='h-3 w-3/5' />
      </View>

      {/* Download button */}
      <Skeleton className='h-10 w-10 shrink-0 rounded-md' />
    </View>
  )
}

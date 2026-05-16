import { Skeleton } from '@/components/ui/skeleton'
import { View } from 'react-native'

export default function MessageListSkeleton() {
  return (
    <View className='flex-1 gap-4 overflow-y-hidden p-4'>
      {[...Array(8)].map((_, i) => (
        <View key={i} className={`${i % 3 === 0 ? 'self-end' : 'self-start'}`}>
          <Skeleton className='h-16 w-64 rounded-2xl' />
        </View>
      ))}
    </View>
  )
}

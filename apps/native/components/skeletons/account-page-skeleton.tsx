import { ScrollView, View } from 'react-native'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'

export default function AccountPageSkeleton() {
  return (
    <ScrollView>
      <View className='mx-auto w-full max-w-md gap-4 rounded-lg px-8 py-2'>
        {/* profile picture */}
        <View className='my-4 flex-row items-center gap-4'>
          <Skeleton className='h-24 w-24 shrink-0 rounded-full' />

          <View className='flex flex-col gap-1'>
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-4 w-40' />
          </View>
        </View>

        <Separator />

        {/* name, username and bio inputs with save button */}
        <View className='my-4 gap-4'>
          <View className='gap-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-10 w-full rounded-md' />
          </View>

          <View className='gap-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full rounded-md' />
          </View>

          <View className='gap-2'>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-20 w-full rounded-md' />
          </View>

          <Skeleton className='h-9 w-20 rounded-md' />
        </View>

        <Separator />

        {/* preferences */}
        <View className='my-4 gap-4'>
          <Skeleton className='h-8 w-24' />

          <View className='flex-row items-center justify-between'>
            <Skeleton className='h-6 w-16' />
            <Skeleton className='h-8 w-24' />
          </View>

          <View className='flex-row items-center justify-between'>
            <Skeleton className='h-6 w-20' />
            <Skeleton className='h-6 w-12' />
          </View>
        </View>

        <Separator />

        {/* security */}
        <View className='my-4 gap-4'>
          <Skeleton className='h-8 w-24' />
          <Skeleton className='h-4 w-64' />

          <View className='gap-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-10 w-full rounded-md' />
            <Skeleton className='h-9 w-20 rounded-md' />
          </View>

          <View className='gap-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-10 w-full rounded-md' />
            <Skeleton className='h-2 w-44' />
            <Skeleton className='h-9 w-20 rounded-md' />
          </View>

          <View className='flex flex-row items-center gap-2'>
            <Skeleton className='h-9 w-20 rounded-md' />
            <Skeleton className='h-9 w-40 rounded-md' />
          </View>
        </View>

        <Separator />

        {/* danger zone */}
        <View className='my-4 gap-4'>
          <Skeleton className='h-8 w-24' />
          <Skeleton className='h-9 w-28 rounded-md' />
          <Skeleton className='h-4 w-64' />
        </View>
      </View>
    </ScrollView>
  )
}

import { Progress } from '@/components/ui/progress'
import { View } from 'react-native'
import { Text } from './ui/text'

interface UsageMeterProps {
  label: string
  used: number
  limit: number
}

export function UsageMeter({ label, used, limit }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0

  return (
    <View className='gap-2'>
      <View className='w-full flex-row justify-between'>
        <Text className='text-sm text-muted-foreground'>{label}</Text>

        <Text className='text-sm text-muted-foreground'>
          {used} / {limit}
        </Text>
      </View>

      <Progress value={percentage} id={label} className='h-1.5' />
    </View>
  )
}

import { View } from 'react-native'
import { Text } from './ui/text'

export default function TypingIndicator() {
  return (
    <View className='flex-row justify-start'>
      <View className='flex-row items-center gap-2 rounded-2xl bg-muted px-4 py-3'>
        <View className='flex-row gap-1'>
          <View className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]' />
          <View className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]' />
          <View className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60' />
        </View>

        <Text className='text-xs text-muted-foreground'>typing...</Text>
      </View>
    </View>
  )
}

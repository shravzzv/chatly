import { Image, View } from 'react-native'
import { Text } from './ui/text'

interface ChatHeaderProps {
  chatId: string
}

export default function ChatHeader({ chatId }: ChatHeaderProps) {
  return (
    <View className='flex-row items-center gap-2'>
      <Image
        src=''
        alt={`${chatId}'s profile picture`}
        className='size-10 rounded-full bg-blue-200'
      />

      <View>
        <Text>{chatId}</Text>
        <Text className='text-xs text-muted-foreground'>@{chatId}</Text>
      </View>
    </View>
  )
}

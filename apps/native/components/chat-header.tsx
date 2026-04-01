import { Image, View } from 'react-native'
import { Text } from './ui/text'

interface ChatHeaderProps {
  chatId: string
}

export default function ChatHeader({ chatId }: ChatHeaderProps) {
  return (
    <View className='flex-row items-center gap-2'>
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1774099690562-b42feac28887?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        }}
        alt='profile'
        className='size-10 rounded-full shadow'
      />

      <View>
        <Text>user</Text>
        <Text className='text-xs text-muted-foreground'>@username</Text>
      </View>
    </View>
  )
}

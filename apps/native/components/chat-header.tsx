import { useAuthContext } from '@/providers/auth-provider'
import { usePrivateContext } from '@/providers/private-provider'
import { View } from 'react-native'
import ProfileAvatar from './profile-avatar'
import { Text } from './ui/text'

interface ChatHeaderProps {
  chatId: string
}

export default function ChatHeader({ chatId }: ChatHeaderProps) {
  const { profiles } = usePrivateContext()
  const { userId } = useAuthContext()
  const profile = profiles.find((p) => p.user_id === chatId)

  return (
    <View className='max-w-2xl flex-row items-center gap-2'>
      {profile && <ProfileAvatar profile={profile} />}

      <View className='flex-1'>
        <Text numberOfLines={1}>
          {profile?.name ??
            `User ${profile?.user_id.slice(0, 4).toUpperCase()}`}
          {profile?.user_id === userId && ' (You)'}
        </Text>

        {profile?.username && (
          <Text numberOfLines={1} className='text-xs text-muted-foreground'>
            @{profile?.username}
          </Text>
        )}
      </View>
    </View>
  )
}

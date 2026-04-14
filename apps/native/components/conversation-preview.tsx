import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Profile } from '@chatly/types/profile'
import { Pressable, View } from 'react-native'
import { Text } from './ui/text'

interface ConversationPreviewProps {
  profile: Profile
  onPress: () => void
}

export default function ConversationPreview({
  profile,
  onPress,
}: ConversationPreviewProps) {
  const avatarFallback =
    profile.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ||
    profile.username?.slice(0, 2).toUpperCase() ||
    '??'

  return (
    <Pressable
      onPress={onPress}
      className='w-full cursor-pointer flex-row items-center gap-3 rounded-xl bg-primary-foreground px-3 py-3 hover:bg-muted active:opacity-70'
    >
      <Avatar alt={profile.name || 'Avatar'} className='size-10 shrink-0'>
        <AvatarImage source={{ uri: profile.avatar_url ?? '' }} />
        <AvatarFallback>
          <Text>{avatarFallback}</Text>
        </AvatarFallback>
      </Avatar>

      <View className='flex min-w-0 flex-1 flex-col'>
        <Text className='font-medium' numberOfLines={1}>
          {profile.name ?? profile.username ?? 'Unnamed user'}
        </Text>

        <Text className='text-xs text-muted-foreground' numberOfLines={2}>
          {Math.round(Math.random()) > 0
            ? 'You: Lorem ipsum dolor sit amet.'
            : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat fugit et delectus quam natus quidem, hic excepturi, aliquid id totam distinctio. Ab soluta amet doloribus quod sit quam laborum doloremque?'}
        </Text>
      </View>
    </Pressable>
  )
}

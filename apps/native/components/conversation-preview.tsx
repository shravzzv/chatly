import { useAuthContext } from '@/providers/auth-provider'
import { Preview } from '@chatly/types/preview'
import { Profile } from '@chatly/types/profile'
import { Pressable, View } from 'react-native'
import ProfileAvatar from './profile-avatar'
import { Skeleton } from './ui/skeleton'
import { Text } from './ui/text'

interface ConversationPreviewProps {
  profile: Profile
  preview: Preview
  isPreviewLoading: boolean
  onPress: () => void
}

export default function ConversationPreview({
  profile,
  onPress,
  preview,
  isPreviewLoading,
}: ConversationPreviewProps) {
  const { userId } = useAuthContext()

  return (
    <Pressable
      onPress={onPress}
      className='w-full cursor-pointer flex-row items-center gap-3 rounded-xl bg-primary-foreground px-3 py-3 hover:bg-muted active:opacity-70'
    >
      <ProfileAvatar profile={profile} />

      <View className='flex min-w-0 flex-1 flex-col'>
        <Text className='font-medium' numberOfLines={1}>
          {profile.name ??
            profile.username ??
            `User ${profile.user_id.slice(0, 4).toUpperCase()}`}
          {profile.user_id === userId && ' (You)'}
        </Text>

        {isPreviewLoading ? (
          <Skeleton className='h-4 w-24 rounded-md' />
        ) : (
          <Text className='text-xs text-muted-foreground' numberOfLines={2}>
            {preview
              ? `${preview.isOwnMsg ? 'You: ' : ''}${preview.text}`
              : 'No messages yet'}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

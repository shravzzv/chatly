import { Text } from '@/components/ui/text'
import { Profile } from '@chatly/types/profile'
import { Image, View } from 'react-native'

interface AccountProfilePictureProps {
  profile: Profile
}

export default function AccountProfilePicture({
  profile,
}: AccountProfilePictureProps) {
  return (
    <View className='my-4 flex-row items-center gap-4'>
      <Image
        source={{
          uri: profile.avatar_url ?? '',
        }}
        alt='avatar'
        className='size-24 rounded-full'
      />

      <View>
        <Text className='font-bold'>Profile Picture</Text>
        <Text className='text-xs text-muted-foreground'>
          JPG, PNG or GIF. Max 5MB.
        </Text>
      </View>
    </View>
  )
}

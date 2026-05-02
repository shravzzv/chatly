import { Profile } from '@chatly/types/profile'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Text } from './ui/text'

interface ProfileAvatarProps {
  profile: Profile
}

export default function ProfileAvatar({ profile }: ProfileAvatarProps) {
  const fallback =
    profile.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ||
    profile.username?.slice(0, 2).toUpperCase() ||
    '??'

  return (
    <Avatar alt={profile.name || 'Avatar'} className='size-10 shrink-0'>
      <AvatarImage source={{ uri: profile.avatar_url ?? '' }} />
      <AvatarFallback>
        <Text>{fallback}</Text>
      </AvatarFallback>
    </Avatar>
  )
}

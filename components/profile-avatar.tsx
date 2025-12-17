import { Profile } from '@/types/profile'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export default function ProfileAvatar({
  profile: { name, username, avatar_url },
}: {
  profile: Profile
}) {
  const fallback =
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ||
    username?.slice(0, 2).toUpperCase() ||
    '??'

  return (
    <Avatar className='h-8 w-8'>
      <AvatarImage
        src={avatar_url || undefined}
        alt={name || username || 'user'}
      />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

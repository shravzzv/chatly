import { Profile } from '@/types/profile'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

type TailwindRounded =
  | 'none'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | 'full'

interface ProfileAvatarProps {
  profile: Profile
  height?: number
  width?: number
  rounded?: TailwindRounded
}

export default function ProfileAvatar({
  profile: { name, username, avatar_url },
  height = 8,
  width = 8,
  rounded = 'full',
}: ProfileAvatarProps) {
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
    <Avatar className={`h-${height} w-${width} rounded-${rounded}`}>
      <AvatarImage
        src={`${avatar_url}?t=${new Date().getTime()}` || undefined}
        alt={name || username || 'user'}
        className='object-cover'
      />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

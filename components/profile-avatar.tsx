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

type TailwindSize = 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20

interface ProfileAvatarProps {
  profile: Profile
  height?: TailwindSize
  width?: TailwindSize
  rounded?: TailwindRounded
}

const ROUNDED_MAP: Record<TailwindRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

const H_MAP: Record<TailwindSize, string> = {
  4: 'h-4',
  5: 'h-5',
  6: 'h-6',
  8: 'h-8',
  10: 'h-10',
  12: 'h-12',
  16: 'h-16',
  20: 'h-20',
}

const W_MAP: Record<TailwindSize, string> = {
  4: 'w-4',
  5: 'w-5',
  6: 'w-6',
  8: 'w-8',
  10: 'w-10',
  12: 'w-12',
  16: 'w-16',
  20: 'w-20',
}

export default function ProfileAvatar({
  profile,
  height = 8,
  width = 8,
  rounded = 'full',
}: ProfileAvatarProps) {
  const { name, username, avatar_url } = profile

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
    <Avatar
      className={`
        ${H_MAP[height]} 
        ${W_MAP[width]} 
        ${ROUNDED_MAP[rounded]} 
        shadow shrink-0 overflow-hidden
      `}
    >
      <AvatarImage
        src={avatar_url || undefined}
        alt={name || username || 'User avatar'}
        className='aspect-square object-cover'
      />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

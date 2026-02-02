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

interface ProfileAvatarProps {
  /** The user profile data containing name, username, and avatar URL. */
  profile: Profile
  /** * The height following Tailwind's spacing scale (1 unit = 0.25rem).
   * Example: 8 = 2rem (32px), 24 = 6rem (96px).
   * @default 8
   */
  height?: number
  /** * The width following Tailwind's spacing scale (1 unit = 0.25rem).
   * @default 8
   */
  width?: number
  /** The Tailwind border-radius class key. @default 'full' */
  rounded?: TailwindRounded
}

export default function ProfileAvatar({
  profile,
  height = 8,
  width = 8,
  rounded = 'full',
}: ProfileAvatarProps) {
  const { name, username, avatar_url } = profile

  const sizeStyle = {
    height: `${height * 0.25}rem`,
    width: `${width * 0.25}rem`,
  }

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
      className={`${ROUNDED_MAP[rounded]} shadow shrink-0 overflow-hidden`}
      style={sizeStyle}
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

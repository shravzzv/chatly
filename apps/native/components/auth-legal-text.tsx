import { PRIVACY, TERMS } from '@/lib/links'
import { Link } from 'expo-router'
import { Text } from './ui/text'

export default function AuthLegalText() {
  return (
    <Text className='max-w-sm text-center text-sm text-muted-foreground'>
      By clicking continue, you agree to our{' '}
      <Link
        href={TERMS}
        target='_blank'
        className='underline underline-offset-4'
      >
        Terms of Service
      </Link>{' '}
      and{' '}
      <Link
        href={PRIVACY}
        target='_blank'
        className='underline underline-offset-2'
      >
        Privacy Policy
      </Link>
      .
    </Text>
  )
}

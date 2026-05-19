import { useAuthContext } from '@/providers/auth-provider'
import { AlertCircle, BadgeCheck } from 'lucide-react-native'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Text } from './ui/text'

export default function AccountEmailStatus() {
  const { user } = useAuthContext()
  const newEmail = user?.new_email

  if (!user) return null

  if (!newEmail) {
    return (
      <Alert
        icon={BadgeCheck}
        iconClassName='text-emerald-600 dark:text-emerald-200 size-5 z-20'
        className='border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
      >
        <AlertTitle className='text-sm'>Email verified</AlertTitle>
        <AlertDescription>
          <Text>
            Your email <Text className='font-bold text-sm'>{user.email}</Text>{' '}
            has been confirmed and is active.
          </Text>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert icon={AlertCircle}>
      <AlertTitle>Confirm your new email</AlertTitle>
      <AlertDescription className='space-y-2'>
        <Text>
          We&apos;ve sent a confirmation link to{' '}
          <strong>{user.new_email}</strong>.
        </Text>

        <Text>
          Until it&apos;s confirmed, your current email{' '}
          <Text className='font-bold'>{user.email}</Text>
          will continue to be used.
        </Text>

        <Button variant='outline' size='sm' className='mt-2 cursor-pointer'>
          Resend confirmation email
        </Button>
      </AlertDescription>
    </Alert>
  )
}
